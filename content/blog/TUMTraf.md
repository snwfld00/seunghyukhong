---
title: "TUMTraf: A New Benchmark and Fusion Method for Event-based ITS"
date: 2025-09-18
excerpt: "조명 조건이 열악한 환경에서도 강건한 객체 탐지를 위해 제안된 새로운 RGB-Event Sensor Fusion 방법론. Targetless Calibration과 Spatiotemporal Late Fusion(STLF)을 통해 ITS 시스템의 신뢰성을 한 단계 높였습니다."
tags: [Event Camera, Sensor Fusion, ITS, Spatiotemporal Fusion, Object Detection, Paper Review]
author: SeungHyuk Hong
---

> **Paper:** [TUMTraf Event: Calibration and Fusion Resulting in a Dataset for Roadside Event-Based and RGB Cameras](https://arxiv.org/abs/2401.08474) (IEEE T-IV 2024)

## 1. Abstract & Introduction
지능형 교통 시스템(ITS, Intelligent Transportation Systems)에서 객체 탐지의 정확도와 신뢰성은 안전과 직결되는 문제입니다. **이벤트 카메라(Event Camera)**는 픽셀의 밝기 변화만을 비동기적으로 감지하여 마이크로초(µs) 단위의 높은 시간 해상도와 넓은 다이내믹 레인지(HDR)를 제공합니다. 이는 모션 블러나 야간, 역광 등 기존 RGB 카메라가 취약한 환경에서 탁월한 성능을 발휘합니다.

그러나 이벤트 카메라는 색상(Color)과 텍스처(Texture) 정보가 부재하다는 본질적인 한계가 있습니다. 따라서 RGB 카메라와의 상호 보완적인 **센서 융합(Sensor Fusion)**이 필수적입니다.
본 논문은 실제 도로 환경(Roadside)에서 이벤트-RGB 카메라를 활용하기 위한 포괄적인 솔루션을 제안합니다.
* **Targetless Calibration:** 인프라 특성상 타겟 설치가 어려운 환경을 고려한 자동 보정 기술.
* **Spatiotemporal Late Fusion (STLF):** 야간 및 악천후 상황에서 탐지 성능을 극대화하는 새로운 융합 알고리즘.
* **TUMTraf Dataset:** 고품질의 레이블이 포함된 대규모 이벤트-RGB 데이터셋 공개.

---

## 2. Proposed Methods

본 논문은 두 센서 간의 효율적인 융합을 위해 Calibration부터 Fusion까지의 전체 파이프라인을 설계했습니다.

### 2.1 Sensor Calibration (Targetless)
도로변에 설치된 카메라들은 물리적으로 접근하기 어렵고, 보정을 위한 체커보드(Checkerboard) 등을 설치하기 불가능한 경우가 많습니다. 연구진은 영상 내의 에지(Edge) 정보와 같은 이미지 자체의 특징(Feature)을 활용하여 두 센서 간의 기하학적 관계를 찾아내는 **Targetless Calibration** 기법을 적용하여, 유지 보수의 편의성과 실용성을 확보했습니다.

### 2.2 Fusion Strategies
연구에서는 세 가지 수준의 융합 전략을 비교하고, 최종적으로 STLF를 제안합니다.

![Fusion Pipeline](/blog/tumtraf/fusion-pipeline.png)

*Figure 1: 제안된 Fusion 파이프라인 개요. (좌) Early Fusion, (우) Late Fusion 접근법.*

#### A. Early Fusion
* **Method:** 이벤트 스트림을 일정 시간 동안 누적하여 프레임 형태로 변환한 후, RGB 이미지와 채널 단위로 결합(Concatenation)합니다. 이렇게 생성된 4채널(또는 그 이상) 입력을 YOLOv7 모델에 넣어 학습시킵니다.
* **Pros/Cons:** 구현이 간단하고 모델이 두 모달리티의 상관관계를 직접 학습할 수 있지만, 모달리티 간의 정렬(Alignment) 오차에 민감하며 이벤트 데이터의 희소성(Sparsity)이 희석될 수 있습니다.

#### B. Simple Late Fusion
* **Method:** RGB와 이벤트 데이터 각각에 대해 독립적으로 YOLOv7 탐지기를 돌립니다. 그 후 출력된 바운딩 박스들을 융합합니다.
* **Decision Logic:** 두 센서의 탐지 결과가 겹칠 경우(IoU > Threshold), 위치와 크기는 두 박스의 가중 평균으로 결정하되, 객체의 클래스(Class)는 텍스처 정보가 풍부한 RGB의 예측을 따릅니다.

#### C. Spatiotemporal Late Fusion (STLF)
![STLF Algorithm](/blog/tumtraf/stlf-algorithm.png)

*Figure 2: Spatiotemporal Late Fusion의 알고리즘 흐름도. 추적(Tracking) 정보를 활용하여 일시적인 탐지 실패나 노이즈를 보정합니다.*

단순 Late Fusion은 야간에 RGB 카메라가 아예 객체를 보지 못하거나(False Negative), 헤드라이트 빛 반사 등으로 허위 탐지(False Positive)를 할 때 취약합니다. **STLF**는 시간적 정보(Temporal Context)를 활용하여 이를 해결합니다.

1.  **Tracking Integration:** 각 모달리티의 탐지 결과에 **SORT (Simple Online and Realtime Tracking)** 알고리즘을 적용하여 객체에 고유 ID를 부여하고 궤적을 추적합니다.
2.  **Trustworthy Object Selection:**
    * 이벤트 카메라는 조명 변화에 강인하므로, 야간에도 움직이는 물체를 확실하게 포착할 수 있습니다.
    * 알고리즘은 이벤트 카메라에서 $N$ 프레임 이상 지속적으로 탐지되고 추적된 객체를 **"신뢰할 수 있는 객체(Trustworthy Object)"**로 정의합니다.
3.  **Fusion Logic:**
    * 만약 현재 시점에 RGB가 객체를 탐지하지 못했더라도, 해당 위치에 'Trustworthy Object'가 존재한다면 최종 결과에 포함시킵니다.
    * 반대로, RGB가 무언가를 탐지했더라도 이벤트 카메라의 지지(Support)가 없고 과거 궤적과 일치하지 않는다면(False Positive 의심), 이를 과감히 제거합니다.
    * 이를 통해 **Spatiotemporal(공간+시간)** 정보를 모두 활용한 강건한 의사결정을 내립니다.

---

## 3. Experiments

### 3.1 TUMTraf Dataset
본 연구를 위해 독일 뮌헨의 실제 교차로와 고속도로 환경에서 수집한 **TUMTraf 데이터셋**을 공개했습니다.
* **Composition:** 2,000개 이상의 레이블된 이미지와 1,000만 개 이상의 이벤트가 포함되어 있습니다.
* **Diversity:** 주간, 야간, 비 오는 날 등 다양한 조명 및 기상 조건을 포함하여 ITS 알고리즘 검증에 최적화되어 있습니다.

### 3.2 Performance Evaluation
![Performance Comparison](/blog/tumtraf/performance-comparison.png)

*Figure 3: 시간대별 및 융합 방법별 성능 비교 (mAP@0.5).*

* **Robustness in Night Scenarios:** 주간에는 RGB 단일 모델도 높은 성능을 보이지만, **야간 환경**에서는 성능이 급격히 저하됩니다. 반면, STLF를 적용한 모델은 야간에도 주간과 거의 대등하거나 훨씬 우수한 성능을 유지했습니다.
* **Fusion Effectiveness:** 단순 Late Fusion 대비 STLF는 mAP 기준으로 유의미한 성능 향상을 보였으며, 특히 False Positive를 억제하는 데 큰 효과를 보였습니다. Early Fusion은 일부 상황에서는 효과적이었으나, 조명 변화가 극심한 상황에서는 STLF보다 불안정한 모습을 보였습니다.

---

## 4. Conclusion
**TUMTraf** 연구는 이벤트 카메라가 단순히 RGB의 보조 수단이 아니라, 극한의 환경에서 시스템의 **안전성(Safety)**을 보장하는 핵심 센서임을 증명했습니다.
특히 제안된 **Spatiotemporal Late Fusion**은 단일 프레임 정보에만 의존하던 기존 융합 방식의 한계를 넘어, 시간적 궤적 정보를 결합함으로써 ITS 분야에서 센서 퓨전이 나아가야 할 방향을 제시했습니다. 이는 자율주행 차량뿐만 아니라 스마트 시티 인프라 구축에도 즉시 적용 가능한 실용적인 기술입니다.