---
title: LEOD: Label-Efficient Object Detection for Event Cameras
date: 2025-05-06
excerpt: 이벤트 카메라를 위한 Semi-supervised Object Detection 논문, Pseudo-label을 활용하여 적은 레이블 데이터로 효율적인 학습을 달성하는 방법에 대한 연구입니다.
tags: [Event Camera, Object Detection, Semi-Supervised Learning, Paper Review]
author: SeungHyuk Hong
---

> **Paper:** [LEOD: Label-Efficient Object Detection for Event Cameras](https://arxiv.org/abs/2311.17286) (CVPR 2024)

# Abstract & Introduction
  Exploits the **low latency** and **high dynamic range** of event cameras for fast and precise object detection.
  High temporal resolution makes per-timestamp labeling costly (e.g., the Gen1 dataset provides labels at only <4 Hz).
  Uses a pre-trained detector on limited labeled data to generate **pseudo-labels** for unlabeled events, then retrains by combining true and pseudo labels. Enhances pseudo-label quality through temporal consistency, bidirectional inference, and tracking-based post-processing. 
  On the Gen1 dataset, RVT-S using 1% and 2% labels shows mAP improvements of 8.6% and 7.8%, respectively. On the 1Mpx dataset, using only 10% labels achieves performance comparable to fully supervised training (100% labels). 
  Object detection transforms raw sensor data into meaningful bounding boxes—a critical task in safety-critical applications like autonomous driving where speed is essential. LEOD provides a novel direction by leveraging event cameras’ advantages while innovatively addressing the labeling challenge.
  LEOD is based on [RVT](https://arxiv.org/abs/2212.05598) model.
  
# Backgrounds
### Pseudo Labeling

![](https://velog.velcdn.com/images/snwfld/post/c8027ead-9870-415b-b7ec-2947ad6fb568/image.png)
LEOD applied pseudo-labeling to **semi-supervised learning** to improve model performance by minimizing reliance on manually annotated data while exploiting unlabeled event streams.
### Test Time Augmentation

![](https://velog.velcdn.com/images/snwfld/post/6124e838-5a3b-485c-bf5a-47ef61270bff/image.png)
Test Time Augmentation (TTA) enhanced model performance by generating multiple augmented versions of the input image at inference time. The model makes predictions on each version, and these are aggregated to produce a more robust and accurate final prediction.
# Methods
![](https://velog.velcdn.com/images/snwfld/post/713b1ec0-f29f-4940-9919-fd2080b42278/image.png)
LEOD is trained based on the RVT model through the process shown in the figure above.
- **Pre-train** an event-based object detector on event streams with limited labels.
- **TTA & Ensemble**: Test-Time Augmentation (TTA) is applied by flipping the temporal sequence of events, and predictions from both forward and backward event streams are ensembled.
- **Filter & Track**: Forward and backward tracking is used to identify and remove temporally inconsistent bounding boxes, such as those associated with short tracks.
- **Soft Anchor Assignment**: Adjust loss function application to handle incomplete Pseudo Labels label noise, such as accompanying noise.
- **Self-Training**: The model is retrained using reliable pseudo labels, and steps 1–4 are repeated to progressively enhance performance.
# Experiments
![](https://velog.velcdn.com/images/snwfld/post/596a0283-90c2-472e-b4ee-6f30c90d6e7b/image.png)
**Result**: 
![](https://velog.velcdn.com/images/snwfld/post/fe7ab0d7-708a-41d4-9436-cd5da7ba0f85/image.png)
![](https://velog.velcdn.com/images/snwfld/post/64c33b69-b782-4848-b48c-90751aa6f8b9/image.png)
![](https://velog.velcdn.com/images/snwfld/post/8940284c-db6c-4745-a94a-6ea8e6594651/image.png)
![](https://velog.velcdn.com/images/snwfld/post/84a03999-15c5-4221-9fff-0518ff405739/image.png)
# Conclusion
LEOD introduces multiple techniques to enhance pseudo-label quality. As a result, extensive experiments on Gen1 and 1Mpx datasets show LEOD outperforms baselines across all label settings.

Experiments have limitation that is conducted only intra-dataset (using data from the same protocol).

Those are future Directions.
- Joint training on multiple, real-world multi-object event sequence datasets.
- Leverage unlabeled data to improve performance and generalization further.