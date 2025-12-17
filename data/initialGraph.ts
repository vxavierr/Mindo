import { MindNode, UserMetrics } from '../types';

export const initialMetrics: UserMetrics = {
  confidenceScore: 72,
  knowledgeEntropy: 15,
  synapticVelocity: 1.2,
  streakDays: 8,
  totalNodes: 142,
  totalConnections: 190,
  hoursThisWeek: 14.2,
};

export const initialNodes: MindNode[] = [
  {
    id: 'node-1',
    position: { x: 0, y: 0 }, // Center
    data: {
      label: 'Neurociência',
      type: 'text',
      status: 'mastered',
      tags: ['#Ciência'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      lastReview: new Date().toISOString(),
      weight: 2,
      content: `<p>Neurociência é o estudo científico do sistema nervoso. É uma ciência multidisciplinar que combina fisiologia, anatomia, biologia molecular, biologia do desenvolvimento, citologia, ciência da computação e modelagem matemática para entender as propriedades fundamentais e emergentes dos neurônios e circuitos neurais.</p>`,
      memoryUnits: [
        {
          id: 'mu-1',
          textSegment: 'sistema nervoso',
          question: 'Qual é o principal objeto de estudo da Neurociência?',
          answer: 'O sistema nervoso.',
          status: 'mastered'
        }
      ]
    },
    type: 'mindNode'
  },
  {
    id: 'node-2',
    position: { x: -250, y: 150 }, // Left-Down
    data: {
      label: 'Plasticidade Neural',
      type: 'text',
      status: 'review_due',
      tags: ['#Ciência', '#Memória'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      lastReview: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 1,
      content: `<p><strong>Plasticidade neural</strong>, também conhecida como neuroplasticidade, é a capacidade das redes neurais no cérebro de mudar através do crescimento e reorganização. É quando o cérebro é reconectado para funcionar de uma maneira diferente de como funcionava anteriormente.</p><p>Essas mudanças vão desde caminhos de neurônios individuais fazendo novas conexões, até ajustes sistemáticos como remapeamento cortical.</p>`,
      memoryUnits: [
        {
          id: 'mu-2',
          textSegment: 'crescimento e reorganização',
          question: 'Através de quais dois mecanismos principais o cérebro muda na neuroplasticidade?',
          answer: 'Crescimento e reorganização.',
          status: 'learning'
        },
        {
          id: 'mu-3',
          textSegment: 'remapeamento cortical',
          question: 'Dê um exemplo de ajuste sistemático na plasticidade.',
          answer: 'Remapeamento cortical.',
          status: 'new'
        }
      ]
    },
    type: 'mindNode'
  },
  {
    id: 'node-3',
    position: { x: 250, y: 150 }, // Right-Down
    data: {
      label: 'Memória de Longo Prazo',
      type: 'text',
      status: 'learning',
      tags: ['#Memória'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      lastReview: new Date().toISOString(),
      weight: 1,
      content: `<p>Memória de longo prazo é o estágio do modelo de memória dupla proposto pelo modelo de memória Atkinson-Shiffrin onde o conhecimento informativo é armazenado indefinidamente. É definida em contraste com a memória de curto prazo e memória de trabalho.</p>`,
      memoryUnits: [
        {
          id: 'mu-4',
          textSegment: 'indefinidamente',
          question: 'Por quanto tempo o conhecimento é mantido na memória de longo prazo?',
          answer: 'Indefinidamente.',
          status: 'mastered'
        }
      ]
    },
    type: 'mindNode'
  },
];
