---
title: "RT-DETR: DETRs Beat YOLOs on Real-time Object Detection"
date: 2025-07-01
excerpt: "YOLO의 NMS로 인한 병목 현상과 DETR의 높은 연산 비용 문제를 동시에 해결한 최초의 실시간 End-to-End 객체 탐지기. Efficient Hybrid Encoder와 Uncertainty-minimal Query Selection을 제안합니다."
tags: [Real-Time Object Detection, DETR, YOLO, End-to-End, Deep Learning, Paper Review]
author: SeungHyuk Hong
---

> **Paper:** [DETRs Beat YOLOs on Real-time Object Detection](https://arxiv.org/abs/2304.08069) (CVPR 2024)

# 1. Abstract & Introduction

실시간 객체 탐지(Real-Time Object Detection) 분야는 오랫동안 **YOLO** 시리즈가 주도해 왔습니다. 그러나 YOLO와 같은 CNN 기반 탐지기들은 **NMS(Non-Maximum Suppression)** 후처리 과정이 필수적입니다. NMS는 추론 속도를 지연시킬 뿐만 아니라, 하이퍼파라미터(Threshold)에 따라 성능이 민감하게 변하는 불안정성을 야기합니다.

반면, **DETR(DEtection TRansformer)** 계열은 NMS 없는(NMS-free) End-to-End 학습이 가능하지만, 높은 연산 비용으로 인해 실시간 처리에 한계가 있었습니다. 특히 다중 스케일(Multi-scale) 특징을 활용할 때 입력 시퀀스의 길이가 폭발적으로 증가하여 인코더에서 병목 현상이 발생합니다.

본 논문은 이러한 두 가지 접근법의 한계를 극복한 **RT-DETR**을 제안합니다.

* **Efficient Hybrid Encoder:** 다중 스케일 특징의 상호작용을 효율적으로 분리하여 연산 속도를 획기적으로 개선했습니다.
* **Uncertainty-minimal Query Selection:** 인코더 특징으로부터 고품질의 초기 쿼리를 선별하여 탐지 정확도를 높였습니다.

---

# 2. Proposed Methods

RT-DETR의 전체 아키텍처는 Backbone, Efficient Hybrid Encoder, 그리고 Transformer Decoder로 구성됩니다. 핵심 기술인 인코더와 쿼리 선택 모듈을 상세히 설명합니다.

![RT-DETR Pipeline](/blog/rt-detr/pipeline.png)

## 2.1 Efficient Hybrid Encoder

기존 DETR 모델들은 모든 스케일의 특징을 평탄화(Flatten)하여 하나의 긴 시퀀스로 만든 후 Attention을 수행했습니다. 이는 이미지 해상도가 높을수록 연산량이 제곱으로 증가하는 원인이 됩니다. RT-DETR은 이를 해결하기 위해 **Intra-scale Interaction**과 **Cross-scale Fusion**을 분리(Decoupling)하는 전략을 취합니다.

![Efficient Hybrid Encoder](/blog/rt-detr/hybrid-encoder.png)

### A. Attention-based Intra-scale Feature Interaction (AIFI)

상위 레벨의 특징(High-level features, $S_5$)은 이미지 내의 객체에 대한 풍부한 의미(Semantic) 정보를 담고 있습니다. 반면, 하위 레벨 특징($S_3, S_4$)은 엣지나 패턴 같은 공간적 세부 정보를 포함합니다.

* RT-DETR은 연산 비용이 높은 **Self-Attention 연산을 오직 $S_5$ 스케일에만 적용**합니다. ($S_5$는 해상도가 낮아 시퀀스 길이가 짧으므로 연산 부담이 적음)
* 이를 통해 객체 간의 전역적인 관계(Global Context)를 효율적으로 포착하면서도 불필요한 저수준 특징 간의 상호작용을 배제하여 연산 효율을 극대화합니다.

### B. CNN-based Cross-scale Feature Fusion (CCFF)

서로 다른 스케일의 특징들을 융합하는 과정에서는 CNN 기반 구조를 활용합니다.

* AIFI를 통과한 $S_5$ 특징과 나머지 $S_3, S_4$ 특징을 융합하기 위해 **Fusion Block**을 설계했습니다.
* 각 융합 단계에서는 **RepBlock** (Reparameterization Block, YOLO 등에서 사용되는 효율적인 Conv 블록)을 사용하여 특징 맵을 효과적으로 섞고 채널을 조정합니다.
* 이 방식은 Transformer의 복잡한 Attention 없이도 다중 스케일 특징을 효과적으로 통합할 수 있게 해줍니다.

## 2.2 Uncertainty-minimal Query Selection

DETR의 성능은 디코더에 입력되는 **Object Query**의 품질에 크게 좌우됩니다. 기존 모델들은 인코더 특징 중 **분류 점수(Classification Score)**가 높은 상위 $K$개의 특징을 선택하여 쿼리로 사용했습니다.

![Uncertainty-minimal Query Selection](/blog/rt-detr/query-selection.png)

* **문제점:** 분류 점수가 높다고 해서 해당 특징이 객체의 **정확한 위치(Localization)**를 담고 있다고 보장할 수 없습니다. 즉, 분류 점수와 위치 정확도 간의 불일치(Misalignment)가 존재합니다.

* **해결책:** RT-DETR은 **Uncertainty-minimal Query Selection**을 제안합니다. 이는 쿼리 선택 시 분류 점수뿐만 아니라, 예측된 박스의 **위치 불확실성(IoU Score 등)**을 함께 고려하는 방식입니다.

* 분류 점수와 예측된 IoU 품질을 결합한 점수를 기준으로 상위 $K$개를 선택함으로써, 디코더가 더 정확한 초기 위치 정보와 의미 정보를 가지고 탐지를 시작할 수 있도록 합니다. 이는 모델의 수렴 속도를 높이고 최종 성능을 향상시키는 데 기여합니다.

---

# 3. Experiments

## 3.1 Quantitative Analysis

![COCO Performance Comparison](/blog/rt-detr/coco-comparison.png)

* **Comparison with YOLO:** RT-DETR-L은 **53.0% AP / 114 FPS**를 기록하며, YOLOv8-L (52.9% AP / 75 FPS) 대비 정확도는 유사하지만 속도는 약 50% 더 빠릅니다. RT-DETR-X 역시 YOLOv8-X보다 높은 정확도와 빠른 속도를 달성했습니다.

* **Comparison with DETR:** 기존 SOTA인 DINO-Deformable-DETR-R50과 비교했을 때, RT-DETR-R50은 정확도는 2.2% AP 더 높으면서 속도는 무려 21배 빠릅니다.

## 3.2 Ablation Study

![Ablation Study](/blog/rt-detr/ablation-study.png)

* **Encoder Variants:** AIFI를 $S_5$에만 적용하고 CCFF를 사용하는 구성(DS5 + CCFF)이, 모든 스케일에 Attention을 적용하거나 단순히 Concat하는 방식보다 성능과 속도 면에서 가장 우수한 균형을 보였습니다.

* **Query Selection:** Uncertainty-minimal Query Selection을 적용했을 때, 단순 Classification Score 기반 선택보다 AP가 유의미하게 향상됨을 확인했습니다.

---

# 4. Conclusion

RT-DETR은 **"실시간 객체 탐지 = YOLO"**라는 공식을 깨고, Transformer 기반 모델도 실시간 처리가 가능함을 증명했습니다.

1.  **NMS-free:** 후처리 과정을 제거하여 추론 속도의 안정성을 확보했습니다.

2.  **Architecture Efficiency:** Intra-scale과 Cross-scale 처리를 분리한 하이브리드 인코더 설계를 통해 연산 효율을 극대화했습니다.

3.  **Accuracy:** 불확실성을 고려한 쿼리 선택으로 초기화 품질을 높여 SOTA 성능을 달성했습니다.

이 연구는 자율주행, 로보틱스 등 실시간성과 정확도가 모두 요구되는 응용 분야에서 YOLO의 강력한 대안이 될 것입니다.
