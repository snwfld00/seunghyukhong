---
title: "YOLOv12: Attention-Centric Real-Time Object Detector"
date: 2025-08-14
excerpt: "CNN의 한계를 넘어 Attention 중심의 아키텍처로 진화한 YOLOv12. Area Attention과 R-ELAN 설계를 통해 계산 복잡도를 획기적으로 낮추면서도 SOTA 성능과 실시간 속도를 동시에 달성했습니다."
tags: [YOLO, Object Detection, Attention Mechanism, Real-Time, Deep Learning, Paper Review]
author: SeungHyuk Hong
---

> **Paper:** [YOLOv12: Attention-Centric Real-Time Object Detectors](https://arxiv.org/abs/2502.12524) (NeurIPS 2025)

## 1. Abstract & Introduction

실시간 객체 탐지(Real-Time Object Detection) 분야에서 **YOLO(You Only Look Once)** 프레임워크는 독보적인 위치를 차지해 왔습니다. 그동안 YOLO 시리즈의 발전은 주로 손실 함수(Loss Function), 레이블 할당(Label Assignment), 그리고 CNN 기반의 아키텍처 최적화에 집중되어 왔습니다.

하지만 최근 컴퓨터 비전 분야는 **Vision Transformer(ViT)**가 주도하고 있습니다. Attention 메커니즘은 전역적인 문맥(Global Context)을 파악하는 능력이 뛰어나 CNN보다 높은 정확도를 보이지만, 실시간성이 중요한 객체 탐지에서는 치명적인 단점이 존재합니다.

* **이차적 계산 복잡도(Quadratic Complexity):** 입력 시퀀스 길이의 제곱($O(L^2)$)에 비례하는 연산량.
* **비효율적인 메모리 접근:** 불규칙한 메모리 패턴으로 인한 높은 지연 시간(Latency).

이로 인해 기존에는 "속도는 CNN, 성능은 Attention"이라는 트레이드오프가 존재했습니다. **YOLOv12**는 이러한 통념을 깨고, **Attention 중심(Attention-Centric)**의 설계를 통해 CNN 수준의 빠른 속도를 유지하면서도 Attention 기반 모델의 우수한 성능을 달성하는 것을 목표로 합니다.

---

## 2. Proposed Methods

YOLOv12의 핵심 기여는 기존 Attention의 비효율성을 개선한 **Area Attention**과, 심층 신경망의 최적화 문제를 해결한 **R-ELAN** 구조입니다.

### 2.1 Area Attention

기존의 고해상도 이미지를 처리하는 ViT 모델들은 연산량을 줄이기 위해 **Window-based Attention**을 사용했습니다. 하지만 이 방식은 윈도우 분할(Partitioning) 및 병합 과정에서 오버헤드가 발생하고, 수용 필드(Receptive Field)가 국소적으로 제한되는 단점이 있습니다.

![Area Attention](/blog/yolov12/area-attention.png)

YOLOv12는 **Area Attention**을 제안합니다.

* **Reshape-based Approach:** 복잡한 윈도우 분할 대신, 단순히 Feature Map을 넓은 영역(Area) 단위로 **Reshape**하여 Attention을 수행합니다. 예를 들어, 가로/세로를 일정 비율로 축소하여 키/밸류(Key/Value)를 생성함으로써 넓은 영역의 정보를 적은 연산으로 집약합니다.

* **Efficient Global Context:** 이를 통해 추가적인 메모리 복사나 전처리 오버헤드 없이 넓은 수용 필드를 확보하며, GPU 하드웨어에서의 병렬 처리 효율을 극대화합니다.

### 2.2 R-ELAN (Residual Efficient Layer Aggregation Networks)

YOLO 시리즈에서 널리 사용되던 ELAN(Efficient Layer Aggregation Networks) 구조는 네트워크가 깊어질수록 학습 시 Gradient 흐름이 원활하지 않아 수렴이 불안정해지는 문제가 있었습니다.

![R-ELAN Structure](/blog/yolov12/r-elan.png)

**R-ELAN**은 이를 해결하기 위해 두 가지 개선을 도입했습니다.

1.  **Block-wise Residual Shortcut:** 블록의 입력에서 출력으로 바로 연결되는 Shortcut을 추가하되, **Scale Factor (기본값 0.01)**를 곱하여 더해줍니다. 이는 DeepViT의 LayerScale과 유사한 원리로, 초기 학습 시에는 Identity Mapping에 가깝게 동작하여 깊은 망에서도 안정적인 학습을 보장합니다.

2.  **Simplified Aggregation:** 불필요한 Feature Split 과정을 제거하고 단일 Feature Map을 사용하여, 메모리 사용량과 파라미터 수를 줄이면서도 정보 전달 효율을 높였습니다.

### 2.3 Architectural Improvements

* **Positional Encoding 제거:** 기존 ViT는 위치 정보를 위해 Positional Encoding을 더해주어야 했지만, YOLOv12는 이를 제거했습니다. 대신 **7x7 Convolution**을 추가하거나 Area Attention 구조 내에서 위치 정보가 암묵적으로 학습되도록 유도하여 구조를 단순화했습니다.

* **FlashAttention 적용:** 최신 GPU에 최적화된 Attention 커널인 FlashAttention을 도입하여 메모리 접근 속도를 비약적으로 향상시켰습니다.

* **Optimized Backbone:** 백본의 마지막 스테이지를 단일 R-ELAN 블록으로 대체하여 전체적인 연산 비용을 최적화했습니다.

---

## 3. Experiments

### 3.1 Comparison with SOTA

![COCO Performance Comparison](/blog/yolov12/coco-comparison.png)

실험 결과, YOLOv12는 기존 실시간 탐지기(YOLOv8, v10 등) 및 Attention 기반 모델(RT-DETR 등)을 모두 압도하는 성능을 보였습니다.

* 동일한 연산 예산(Computational Budget) 하에서 CNN 기반 모델보다 최대 **3배** 더 효율적인 성능 곡선을 보여줍니다.

* 특히 L(Large), X(Extra-large) 스케일의 대형 모델에서도 AdamW 옵티마이저를 사용하여 안정적으로 수렴함이 확인되었습니다.

### 3.2 Ablation Study

![Ablation Study](/blog/yolov12/ablation-study.png)

* **Area Attention의 효과:** 일반적인 Global Attention이나 Window Attention을 사용했을 때보다 Area Attention을 적용했을 때 속도 저하 없이 정확도가 상승했습니다.

* **R-ELAN의 효과:** Residual Shortcut과 Scale Factor가 없을 경우, 특히 대형 모델에서 학습이 발산하거나 성능이 저하되는 현상이 발생했습니다. R-ELAN은 이를 효과적으로 방지했습니다.

---

## 4. Conclusion

**YOLOv12**는 "실시간 탐지에는 CNN이 유리하다"는 고정관념을 깨뜨렸습니다. **Area Attention**을 통해 Attention 메커니즘의 연산 비효율을 극복하고, **R-ELAN**을 통해 깊은 네트워크의 최적화 난이도를 낮췄습니다. 결과적으로 YOLOv12는 속도와 정확도라는 두 마리 토끼를 모두 잡으며, 차세대 실시간 객체 탐지의 새로운 표준을 제시했습니다. 다만, 여느 YOLO 시리즈와 마찬가지로 극소형 객체(Tiny Objects)에 대한 탐지 성능은 지속적인 개선이 필요합니다.
