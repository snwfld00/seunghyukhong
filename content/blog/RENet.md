---
title: "RENet: Multi-scale Temporal Events Aggregation for RGB-Event Fusion"
date: 2025-11-24
excerpt: "단일 스케일 및 단방향 융합의 한계를 극복한 RGB-Event 객체 탐지 네트워크. Multi-scale Temporal Events Aggregation(E-TMA)과 Bi-Directional Calibration(BDC)을 통해 이동 객체 탐지 성능을 극대화했습니다."
tags: [Event Camera, RGB-Event Fusion, Object Detection, Multimodal Learning, Deep Learning, Paper Review]
author: SeungHyuk Hong
---

> **Paper:** [RGB-Event Fusion for Moving Object Detection in Autonomous Driving](https://arxiv.org/abs/2209.08323) (ICRA 2023)

## 1. Abstract & Introduction
이벤트 카메라(Event Camera)는 마이크로초 단위의 높은 시간 해상도를 가지며, 고속으로 이동하는 물체나 급격한 조명 변화(High Dynamic Range)가 있는 환경에서 RGB 카메라의 약점을 완벽하게 보완합니다. 그러나 기존의 RGB-Event Sensor Fusion 연구들은 크게 두 가지 **구조적 한계(Structural Limitations)**를 가지고 있었습니다.

1.  **Single-scale Input Issue:** 이벤트 데이터는 시간적 범위(Temporal Window)에 따라 정보의 특성이 달라집니다. 짧은 시간의 이벤트는 윤곽선 정보가 뚜렷한 반면, 긴 시간의 이벤트는 모션 정보를 포함하지만 블러(Blur)가 발생합니다. 기존 연구들은 단일 스케일 입력만을 사용하여 이러한 다층적인 시간 정보를 충분히 활용하지 못했습니다.
2.  **Single-directional Fusion Issue:** 대부분의 융합 방식은 이벤트 특징을 단순히 RGB 특징에 더하거나 붙이는(Concatenate) 단방향 방식이었습니다. 이는 두 모달리티 간의 상호 보완적인 정보 교환을 제한하여, 한쪽 데이터의 품질이 낮을 때 전체 성능이 저하되는 원인이 됩니다.

본 논문은 이러한 문제를 해결하기 위해 **RENet**을 제안합니다. RENet은 다중 스케일의 이벤트 정보를 집계하는 **E-TMA** 모듈과, 양방향으로 정보를 보정하는 **BDC** 모듈을 통해 융합의 효율성을 극대화했습니다.

---

## 2. Proposed Methods

RENet의 아키텍처는 크게 인코더, 집계 모듈(E-TMA), 보정 모듈(BDC), 그리고 디코더로 구성됩니다.

### 2.1 E-TMA (Event Temporal Multi-scale Aggregation)
이벤트 데이터의 비동기적 특성을 최대한 활용하기 위해, 시간 축(Temporal Axis)에서 서로 다른 범위를 가지는 다중 입력을 처리하도록 설계되었습니다.

* **Multi-scale Input Strategy:**
    * **Short-range Events:** 물체의 **경계(Boundary)** 및 텍스처 정보가 비교적 뚜렷하게 보존됩니다. 정적인 특징 추출에 유리합니다.
    * **Long-range Events:** 물체의 이동 궤적에 따른 **모션 블러(Motion Blur)**가 포함됩니다. 이는 오히려 이동하는 물체의 존재(Existence)와 방향성을 파악하는 데 중요한 단서(Cue)가 됩니다.
* **Adaptive Pooling:** 긴 시간 범위의 이벤트일수록 더 큰 커널(Kernel) 사이즈의 풀링을 적용하여, 노이즈를 억제하고 전역적인 모션 문맥을 요약합니다. 이렇게 추출된 다중 스케일 특징들은 채널 축으로 결합되어 풍부한 시간적 정보를 표현합니다.

### 2.2 Discrepant Two-streaming Encoder
RGB 이미지와 이벤트 프레임은 데이터의 성격이 매우 다릅니다.
* **RGB:** 조밀한(Dense) 픽셀 값을 가지며 색상과 질감 정보가 풍부합니다. $\rightarrow$ **ResNet-101** 사용.
* **Event:** 희소한(Sparse) 활성화(Activation)를 가지며 에지 정보가 주를 이룹니다. $\rightarrow$ **ResNet-18** 사용.
본 논문은 이러한 특성 차이를 고려하여 비대칭적인(Discrepant) 듀얼 백본 구조를 채택했으며, 1x1 Convolution을 통해 채널 차원을 일치시킨 후 융합 단계로 전달합니다.

### 2.3 Bi-Directional Calibration (BDC)
![BDC Module](/blog/renet/bdc-module.png)

*Figure 1: Bi-Directional Calibration 모듈의 구조. 공간 및 채널 어텐션을 통해 상호 정보를 보정합니다.*

단순한 Summation이나 Concatenation 대신, 두 모달리티가 서로를 가이드하고 보정하는 **양방향 어텐션(Bi-directional Attention)** 메커니즘을 제안합니다.

1.  **Coarse-to-Fine Fusion:**
    * 먼저 1x1 Conv를 통해 각 특징 맵의 가장 유익한(Informative) 정보를 대략적으로(Coarsely) 추출합니다.
    * 이후 **Spatial Attention**과 **Channel Attention**을 순차적으로 적용하여 특징을 정제합니다.
2.  **Cross-Calibration:**
    * RGB 특징에서 추출한 어텐션 맵(Attention Map)을 이벤트 특징에 적용하고, 반대로 이벤트의 어텐션 맵을 RGB에 적용합니다.
    * 예를 들어, RGB가 조명 문제로 물체를 놓쳤더라도 이벤트의 강한 활성화 신호가 RGB 특징의 해당 영역을 강조(Calibration)해 줄 수 있습니다.
3.  **Merge:**
    * 보정된 두 특징($f'_{RGB}, f'_{Event}$)은 학습 가능한 가중치를 가진 Convolution 레이어를 통해 최종적으로 병합되어, 공유된 표현(Shared Representation)을 형성합니다.

---

## 3. Experiments

### 3.1 DSEC-MOD Dataset Construction
기존의 이벤트 기반 데이터셋(DSEC, MVSEC 등)은 주로 Depth estimation이나 Optical Flow를 위한 것이었으며, 객체 탐지(Object Detection)를 위한 레이블이 부재했습니다. 일부 연구에서 자동 생성한 레이블은 신뢰도가 낮았습니다.
연구팀은 이를 극복하기 위해 **DSEC-MOD** 데이터셋을 직접 구축했습니다.
* **Moving Object Detection:** 정지한 물체보다 이동하는 물체(자동차, 보행자 등) 탐지에 초점을 맞추어 수동으로 정밀하게 레이블링을 수행했습니다.
* **High Quality:** 모션 블러가 심한 영역에 대해서도 이벤트 데이터를 참고하여 정확한 바운딩 박스를 제공합니다.

### 3.2 Quantitative Results
![Performance Comparison](/blog/renet/performance-comparison.png)

*Figure 2: 다양한 Fusion 방법론과의 성능 비교.*

* **Comparison with SOTA:** RENet은 Frame mAP 및 Video mAP 지표 모두에서 기존의 단방향 Fusion 모델들을 큰 폭으로 상회했습니다.
* **E-TMA Efficacy:** 단일 스케일만 사용했을 때보다 Multi-scale 이벤트를 사용했을 때 mAP가 유의미하게 상승하여, 시간적 정보 집계의 중요성을 입증했습니다.
* **BDC Efficacy:** 양방향 보정 모듈을 제거하고 단순 결합했을 경우 성능 하락이 발생했습니다. 이는 BDC가 각 모달리티의 노이즈를 억제하고 유효한 신호를 증폭시키는 역할을 수행함을 보여줍니다.

---

## 4. Conclusion
**RENet**은 이벤트 카메라의 잠재력을 십분 활용하기 위해 필수적인 두 가지 요소, 즉 **'시간적 다중 스케일(Multi-scale Temporality)'**과 **'양방향 상호작용(Bi-directional Interaction)'**을 성공적으로 모델링했습니다. 특히 직접 구축한 DSEC-MOD 데이터셋은 향후 이동 객체 탐지 및 센서 퓨전 연구의 중요한 벤치마크가 될 것입니다. RENet은 복잡한 도심 환경이나 고속 주행 상황에서 신뢰할 수 있는 객체 탐지 솔루션을 제공합니다.