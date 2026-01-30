---
title: "Grounding DINO: Marrying DINO with Grounded Pre-training for Open-Set Object Detection"
date: 2026-01-21
excerpt: "DINO의 강력한 탐지 능력과 GLIP의 Grounding 학습 방식을 결합하여, 텍스트 쿼리만으로 학습하지 않은 임의의 객체를 제로샷(Zero-Shot)으로 탐지해내는 Open-Set Object Detector입니다."
tags: [Open-Set Object Detection, Grounding, DINO, Multimodal Learning, Transformer, Paper Review]
author: SeungHyuk Hong
---

> **Paper:** [Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection](https://arxiv.org/abs/2303.05499) (ECCV 2024)

## 1. Abstract & Introduction
전통적인 객체 탐지기(Object Detector)들은 사전에 정의된 특정 카테고리(예: COCO의 80개 클래스)만을 탐지할 수 있는 **Closed-set** 시스템이었습니다. 새로운 객체를 탐지하려면 데이터를 추가하여 모델을 재학습해야 하는 한계가 있습니다.

최근 연구들은 인간의 언어(Text)를 입력으로 받아, 설명에 부합하는 임의의 객체를 찾아내는 **Open-set Object Detection**으로 나아가고 있습니다. 이 분야의 선구적인 연구인 **GLIP(Grounded Language-Image Pre-training)**은 객체 탐지를 **"Phrase Grounding"** 문제(이미지 내의 영역과 텍스트 내의 단어를 매칭하는 문제)로 재정의하여 큰 성공을 거두었습니다.

**Grounding DINO**는 GLIP의 아이디어를 계승하되, Transformer 기반의 SOTA 탐지기인 **DINO** 아키텍처와 결합하여 성능을 극대화했습니다. 단순한 결합을 넘어, 시각 정보와 언어 정보를 초기 단계부터 깊이 있게 융합(Tight Modality Fusion)하여, 학습 과정에서 보지 못한 객체(Unseen Object)에 대해서도 탁월한 일반화 성능을 자랑합니다.

---

## 2. Proposed Methods

Grounding DINO는 **Dual-Encoder** 구조를 기반으로 하며, 이미지와 텍스트 특징을 융합하는 **Feature Enhancer**, 쿼리를 초기화하는 **Language-Guided Query Selection**, 그리고 최종 탐지를 수행하는 **Cross-Modality Decoder**로 구성됩니다.

![Grounding DINO Architecture](/blog/grounding-dino/architecture.png)

*Figure 1: Grounding DINO의 전체 아키텍처. Feature Extraction -> Enhancer -> Query Selection -> Decoder로 이어지는 흐름을 보여줍니다.*

### 2.1 Feature Extraction & Enhancer
이미지 백본(Swin Transformer)과 텍스트 백본(BERT)에서 추출된 특징은 서로 다른 공간에 존재합니다. 이를 정렬(Alignment)하기 위해 **Feature Enhancer** 모듈을 도입했습니다.
* **Self-Attention:** 이미지와 텍스트 각각의 내부 문맥(Intra-modality Context)을 파악합니다.
* **Cross-Attention:** 이미지 특징은 텍스트를, 텍스트 특징은 이미지를 참조하여 상호 정보(Inter-modality Information)를 교환합니다. 이를 통해 "고양이"라는 텍스트가 입력되면 이미지 내의 고양이 영역 특징이 강조되는 식의 상호작용이 초기 단계부터 일어납니다.

### 2.2 Language-Guided Query Selection
DETR 계열 모델의 성능은 **Object Query**의 초기화 품질에 크게 의존합니다. 기존 DINO는 단순히 이미지 특징만을 사용하여 쿼리를 선택했지만, Grounding DINO는 언어 정보를 적극 활용합니다.
* **Mechanism:** 이미지 특징과 텍스트 특징 간의 내적(Dot Product) 등을 통해 관련성 맵을 계산합니다. 입력된 텍스트와 가장 연관성이 높은(High Relevance) 이미지 영역의 특징을 선별하여 디코더의 쿼리로 초기화합니다.
* **Effect:** 이는 모델이 "무엇을 찾아야 하는지"를 알고 탐색을 시작하게 하므로, 탐지 효율과 정확도를 크게 높여줍니다.

### 2.3 Cross-Modality Decoder
디코더에서도 시각-언어 융합은 계속됩니다. 각 디코더 레이어는 다음과 같은 구성을 가집니다.
1.  **Self-Attention:** 쿼리 간의 상호작용.
2.  **Image Cross-Attention:** 쿼리가 이미지 특징을 참조하여 객체의 위치와 형태를 파악.
3.  **Text Cross-Attention:** 쿼리가 텍스트 특징을 참조하여 해당 객체가 지시하는 바(예: "검은색 강아지")를 정확히 이해하고 있는지 확인.
4.  **FFN:** 정보 통합 및 업데이트.

이러한 구조는 쿼리가 시각적 단서와 언어적 단서를 지속적으로 비교하고 업데이트하도록 유도하여 정교한 Grounding을 가능하게 합니다.

### 2.4 Sub-sentence Level Representation
![Sub-sentence Level Representation](/blog/grounding-dino/sub-sentence-level.png)

*Figure 2: 텍스트 프롬프트 처리 방식 비교. Sub-sentence level은 불필요한 의존성을 제거하면서도 세밀한 정보를 유지합니다.*

GLIP 등 기존 연구들은 문장 전체를 하나의 특징으로 인코딩(Sentence Level)하거나, 단어 하나하나를 독립적으로 인코딩(Word Level)하는 방식을 사용했습니다.
* **Issue:** Sentence Level은 세밀한 정보가 뭉개질 수 있고, Word Level은 "Hot dog"와 같이 여러 단어가 합쳐져 하나의 의미를 갖는 경우를 처리하기 어렵거나 불필요한 단어 간 연관성을 학습할 위험이 있습니다.
* **Solution:** Grounding DINO는 **Sub-sentence Level** 표현을 제안합니다. 이는 명사구(Noun Phrase) 단위로 어텐션 마스크(Attention Mask)를 적용하여, 관련된 단어들끼리만 상호작용하게 하고 무관한 단어들과의 연결은 차단합니다. 이를 통해 단어 간의 불필요한 의존성을 제거하면서도 의미 단위의 정보를 정확하게 보존합니다.

---

## 3. Experiments

### 3.1 Zero-Shot Object Detection
![Zero-Shot Performance](/blog/grounding-dino/zero-shot-performance.png)

*Figure 3: COCO, LVIS 등 주요 벤치마크에서의 Zero-Shot 성능 비교.*

COCO 데이터셋으로 학습된 모델을 사용하여, 학습에 포함되지 않은 LVIS(1200개 이상의 카테고리) 데이터셋을 탐지하는 실험에서 압도적인 성능을 보였습니다. 이는 Grounding DINO가 단순히 클래스 이름을 외우는 것이 아니라, **언어와 시각적 특징 간의 관계**를 본질적으로 학습했음을 증명합니다.

### 3.2 Referring Expression Comprehension (REC)
REC는 "왼쪽 의자에 앉아 있는 남자"와 같이 복잡한 수식어가 포함된 텍스트 지시문을 이해하고 해당 객체를 찾는 태스크입니다. Grounding DINO는 RefCOCO/+/g 데이터셋에서 기존 SOTA 모델들을 능가하며, 복잡한 언어 이해 능력을 입증했습니다.

---

## 4. Conclusion
**Grounding DINO**는 DINO의 강력한 탐지 성능을 Open-set 시나리오로 성공적으로 확장했습니다. 핵심은 시각과 언어라는 이질적인 두 모달리티를 **초기 융합(Early Fusion)부터 심층 융합(Deep Fusion)까지** 긴밀하게 연결한 아키텍처 설계에 있습니다.
비록 GLIPv2와 달리 Segmentation 마스크를 생성하지 못한다는 한계가 있지만, 텍스트 프롬프트만으로 세상의 모든 객체를 탐지하려는 비전-언어 모델(Vision-Language Model)의 진보를 보여주는 중요한 이정표가 되는 연구입니다.