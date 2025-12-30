import { ChannelDefinition } from '../types/jobs';

export const CHANNELS: ChannelDefinition[] = [
  {
    id: 'tyomarkkinatori',
    name: 'Työmarkkinatori',
    requiredFields: ['title', 'description', 'location', 'applyUrl'],
    supportsOverrides: true,
  },
  {
    id: 'duunitori',
    name: 'Duunitori',
    requiredFields: ['title', 'description', 'location', 'applyUrl'],
    supportsOverrides: true,
  },
];

export const getChannelConfig = (channelId: string) => CHANNELS.find(c => c.id === channelId);
