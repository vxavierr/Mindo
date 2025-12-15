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
      label: 'Neuroscience',
      type: 'text',
      status: 'mastered',
      tags: ['#Science'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      lastReview: new Date().toISOString(),
      weight: 2,
      content: `<p>Neuroscience is the scientific study of the nervous system. It is a multidisciplinary science that combines physiology, anatomy, molecular biology, developmental biology, cytology, computer science and mathematical modeling to understand the fundamental and emergent properties of neurons and neural circuits.</p>`,
      memoryUnits: [
        {
          id: 'mu-1',
          textSegment: 'nervous system',
          question: 'What is the primary subject of study in Neuroscience?',
          answer: 'The nervous system.',
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
      label: 'Neural Plasticity',
      type: 'text',
      status: 'review_due',
      tags: ['#Science', '#Memory'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      lastReview: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 1,
      content: `<p><strong>Neural plasticity</strong>, also known as neuroplasticity, is the ability of neural networks in the brain to change through growth and reorganization. It is when the brain is rewired to function in some way that differs from how it previously functioned.</p><p>These changes range from individual neuron pathways making new connections, to systematic adjustments like cortical remapping.</p>`,
      memoryUnits: [
        {
          id: 'mu-2',
          textSegment: 'growth and reorganization',
          question: 'Through what two primary mechanisms does the brain change in neuroplasticity?',
          answer: 'Growth and reorganization.',
          status: 'learning'
        },
        {
          id: 'mu-3',
          textSegment: 'cortical remapping',
          question: 'Give an example of a systematic adjustment in plasticity.',
          answer: 'Cortical remapping.',
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
      label: 'Long-term Memory',
      type: 'text',
      status: 'learning',
      tags: ['#Memory'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      lastReview: new Date().toISOString(),
      weight: 1,
      content: `<p>Long-term memory is the stage of the dual memory model proposed by the Atkinson-Shiffrin memory model where informative knowledge is held indefinitely. It is defined in contrast to short-term and working memory.</p>`,
      memoryUnits: [
        {
          id: 'mu-4',
          textSegment: 'indefinitely',
          question: 'How long is knowledge held in long-term memory?',
          answer: 'Indefinitely.',
          status: 'mastered'
        }
      ]
    },
    type: 'mindNode'
  },
];
