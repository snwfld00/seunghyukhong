export interface Publication {
  id: string
  title: string
  authors: string[]
  venue: string
  venueFull: string
  year: number
  tags: string[]
  link?: string
}

export const publications: Publication[] = [
  {
    id: '1',
    title: '이벤트 카메라 기반 객체 인식의 클래스 불균형 문제 분석',
    authors: ['SeungHyuk Hong'],
    venue: 'KCC 2025',
    venueFull: 'Korea Computer Congress 2025',
    year: 2025,
    tags: ['Event Camera', 'Object Detection', 'Class Imbalance'],
    link: 'https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE12318445',
  },
  {
    id: '2',
    title: 'ATOM NPU의 비전 모델 구조별 추론 성능 비교 분석',
    authors: ['SeungHyuk Hong'],
    venue: 'KSC 2025',
    venueFull: 'Korea Software Congress 2025',
    year: 2025,
    tags: ['NPU', 'Vision Model', 'Inference', 'Performance'],
  },
  {
    id: '3',
    title: '금융 합성데이터 생성 및 후처리를 통한 품질 개선',
    authors: ['SeungHyuk Hong'],
    venue: 'ACK 2024',
    venueFull: 'Annual Conference of KIPS 2024',
    year: 2024,
    tags: ['Synthetic Data', 'Finance', 'Data Quality'],
    link: 'https://www.koreascience.kr/article/CFKO202433161571725.pdf',
  },
]

export function getPublicationsByYear(): Record<number, Publication[]> {
  const grouped: Record<number, Publication[]> = {}
  publications.forEach((pub) => {
    if (!grouped[pub.year]) {
      grouped[pub.year] = []
    }
    grouped[pub.year].push(pub)
  })
  return grouped
}
