---
title: "Semi-DETR: Semi-Supervised Object Detection with Stage-wise Hybrid Matching"
date: 2025-05-19
excerpt: "DETR의 One-to-One 매칭이 갖는 Semi-Supervised Learning(SSL) 환경에서의 구조적 한계를 분석하고, 이를 극복하기 위한 Stage-wise Hybrid Matching 및 Cross-view Query Consistency 메커니즘을 제안한 연구입니다."
tags: [Semi-Supervised Learning, Object Detection, DETR, Bipartite Matching, Pseudo-Labeling, Deep Learning, Paper Review]
author: SeungHyuk Hong
---

> **Paper:** [Semi-DETR: Semi-Supervised Object Detection with Detection Transformers](https://arxiv.org/abs/2307.08095) (CVPR 2023)

## 1. Introduction: The Dilemma of DETR in SSOD

최근 Object Detection 분야는 CNN 기반의 One-stage/Two-stage 탐지기에서 Transformer 기반의 DETR(DEtection TRansformer)로 패러다임이 전환되고 있습니다. 그러나 레이블이 부족한 환경인 **Semi-Supervised Object Detection (SSOD)** 태스크에서 DETR을 단순히 적용하는 데에는 근본적인 구조적 한계가 존재합니다.

### 1.1 The Conflict: One-to-One Assignment vs. Noisy Pseudo-Labels

기존 CNN 기반 모델(RetinaNet, YOLO 등)은 **One-to-Many Assignment** 전략을 사용합니다. 하나의 Ground Truth(GT)에 대해 여러 개의 Anchor Box를 양성(Positive)으로 할당하기 때문에, Teacher 모델이 생성한 Pseudo-label에 다소 노이즈가 있더라도 True Positive를 포함할 확률(Recall)이 높아 학습이 안정적입니다.

반면, DETR은 **One-to-One Bipartite Matching**을 수행합니다. 이는 GT와 예측값 간의 엄격한 1:1 대응을 강제하여 NMS(Non-Maximum Suppression) 없는 End-to-End 학습을 가능하게 합니다. 하지만 SSOD의 Teacher-Student 프레임워크에서는 이 장점이 치명적인 약점이 됩니다.

* **Teacher의 오류 전파:** Teacher가 생성한 Pseudo-label은 부정확할 수 있습니다(Noisy Labels).
* **True Negative 유발:** 만약 Teacher가 놓친 객체나 부정확한 박스를 GT로 간주하고 1:1 매칭을 수행하면, Student 모델이 예측한 나머지 타당한 후보들은 모두 강제로 **배경(Negative)**으로 처리됩니다. 이는 모델이 올바른 특징을 학습하는 것을 방해하고 수렴을 저해합니다.

본 논문은 이러한 **"불완전한 Pseudo-label 하에서의 비효율적인 1:1 매칭 문제"**를 해결하기 위해 **Semi-DETR**을 제안합니다.

---

## 2. Methodology

Semi-DETR은 기본적으로 Teacher-Student 구조를 따르며, Teacher 네트워크는 Student 네트워크의 **EMA(Exponential Moving Average)**로 업데이트됩니다. 핵심 기여는 다음 세 가지 모듈로 구성됩니다.

### 2.1 Stage-wise Hybrid Matching

본 논문은 One-to-Many 방식의 높은 Recall과 One-to-One 방식의 정교한 Localization 능력을 결합한 **단계적 하이브리드 매칭(Stage-wise Hybrid Matching)** 전략을 제안합니다.

![Stage-wise Hybrid Matching](/blog/semi-detr/stage-wise-hybrid-matching.png)

1.  **Stage 1: One-to-Many Pairing (Candidate Generation)**
    * 먼저 Teacher가 생성한 각 Pseudo-label에 대해, Student의 예측값 중 매칭 비용(Matching Cost)이 낮은 상위 $M$개의 후보군(Candidate Set)을 할당합니다.
    * 이 단계는 CNN의 Anchor Assignment와 유사하게 작동하며, 노이즈가 섞인 레이블에 대해 모델이 더 넓은 범위의 특징을 탐색할 수 있도록 유도합니다(Recall 증대).

2.  **Stage 2: One-to-One Pairing (Final Assignment)**
    * 선별된 $M$개의 후보군 내에서 헝가리안 알고리즘(Hungarian Algorithm)을 수행하여 최종적으로 가장 적합한 단 하나의 예측만을 선택합니다.
    * 이를 통해 DETR 고유의 1:1 매칭 특성을 유지하며 중복 탐지를 방지합니다.

이 과정에서 분류 점수(Classification Score)와 박스 회귀(Box Regression) 손실의 가중치를 동적으로 조절하여, 초기 학습 단계에서의 불안정성을 완화하고 점진적으로 정교한 매칭이 이루어지도록 설계되었습니다.

### 2.2 Cross-view Query Consistency

SSOD의 핵심은 **Consistency Regularization**입니다. 하지만 DETR의 Object Query는 학습된 위치 정보를 포함하고 있어, 입력 이미지의 뷰(View)가 달라지면 쿼리의 의미적 매칭이 깨질 수 있습니다.

![Cross-view Query Consistency](/blog/semi-detr/cross-view-query-consistency.png)

* **문제점:** 동일한 이미지 $I$에 대해 서로 다른 증강(Augmentation)을 적용한 뷰 $V_1, V_2$가 있을 때, DETR은 동일한 객체라도 뷰에 따라 서로 다른 인덱스의 Query에 할당할 수 있습니다. 기존의 고정된 인덱스 매칭은 이러한 변화를 반영하지 못합니다.

* **해결책:** Semi-DETR은 **Cross-view Query Consistency** 모듈을 통해, 뷰가 다르더라도 동일한 객체를 가리키는 Query들의 **Feature Embedding**이 일관성을 갖도록 학습합니다. 이는 뷰 간의 고정된 매칭 제약을 제거하고, 의미적 유사성(Semantic Similarity)을 기반으로 유연하게 일관성 손실(Consistency Loss)을 계산함으로써 달성됩니다.

### 2.3 Cost-based Pseudo Label Mining

Cross-view Consistency 학습이 효과적이려면, Unlabeled 데이터에서 추출한 Pseudo-label의 품질이 보장되어야 합니다. 기존의 고정된 Confidence Thresholding 방식은 데이터 분포의 변화에 유연하게 대처하지 못합니다.

![Cost-based Pseudo Label Mining](/blog/semi-detr/cost-based-pseudo-label-mining.png)

본 논문은 **GMM(Gaussian Mixture Model)**을 활용하여 매칭 비용(Matching Cost)의 분포를 모델링합니다.

* 모든 예측의 매칭 비용을 수집하여 GMM으로 피팅하면, **신뢰할 수 있는 클러스터(Reliable Cluster)**와 **노이즈 클러스터(Unreliable Cluster)**로 구분할 수 있습니다.
* 이 분포를 기반으로 불확실성이 낮은(Low-uncertainty) Pseudo-label만을 동적으로 선별(Mining)하여 학습에 반영합니다. 이는 하이퍼파라미터 튜닝의 의존도를 낮추고 레이블 품질을 보장하는 역할을 합니다.

---

## 3. Experimental Results

### 3.1 Benchmark Performance (COCO)

COCO 데이터셋을 기준으로 **Partial Label** (1%, 5%, 10% 레이블) 및 **Full Label** 설정에서 실험을 수행했습니다.

![COCO Benchmark Results](/blog/semi-detr/coco-benchmark-results.png)

* **SOTA 달성:** Semi-DETR은 모든 레이블 비율 설정에서 STAC, Unbiased Teacher, Soft Teacher 등 기존의 강력한 CNN 기반 SSOD 모델들을 능가했습니다. 특히 1%의 극소량 레이블 설정에서도 mAP가 크게 향상되어, 제안하는 하이브리드 매칭 전략이 데이터 희소성(Data Scarcity) 문제에 매우 효과적임을 입증했습니다.

* **수렴 속도:** 기존 DETR 기반 방법론 대비 학습 수렴 속도가 빠르며, 이는 Stage-wise Hybrid Matching이 초기 학습의 난이도를 낮춰주는 덕분인 것으로 분석됩니다.

### 3.2 Ablation Study

각 컴포넌트의 기여도를 분석한 결과는 다음과 같습니다.

![Ablation Study](/blog/semi-detr/ablation-study.png)

* **Hybrid Matching의 효과:** 단순 1:1 매칭만 사용했을 때보다 1:Many + 1:1 매칭을 결합했을 때 성능이 비약적으로 상승했습니다.

* **Consistency의 중요성:** Cross-view Query Consistency를 제거하면 성능 하락이 발생하였으며, 이는 DETR 구조에서 쿼리 임베딩의 일관성 학습이 필수적임을 시사합니다.

* **Cost-based Mining:** GMM 기반의 동적 마이닝 방식이 고정 임계값 방식보다 더 강건한 성능을 보였습니다.

---

## 4. Conclusion & Insight

**Semi-DETR**은 DETR을 SSOD에 적용할 때 발생하는 근본적인 문제인 "부정확한 레이블과 엄격한 1:1 매칭의 충돌"을 논리적으로 파고들었습니다.

1.  **Hybrid Matching:** CNN의 장점(Recall)과 DETR의 장점(Precision)을 단계적으로 결합하는 영리한 전략을 제시했습니다.

2.  **Feature Robustness:** 이미지 뷰의 변화에 흔들리지 않는 강건한 Query Feature를 학습하는 방법을 고안했습니다.

이 연구는 향후 Transformer 기반의 Semi-Supervised Learning 연구들이 어떻게 Label Noise를 다루어야 하는지에 대한 중요한 가이드라인을 제시합니다. NMS-free 구조의 장점을 유지하면서도 데이터 효율성을 극대화했다는 점에서 높은 학술적 가치를 지닙니다.
