import { legSort } from './api-event-transformer';
import { Band } from '../event-types';

describe('transfromation between api and client models', () => {
  it('sorts bands correctly', () => {
    const sortedBands = testBands.sort(legSort);
    expect(sortedBands[0].bandId).toEqual('LEFT_TIBIA_1');
    expect(sortedBands[1].bandId).toEqual('LEFT_TIBIA_20');
    expect(sortedBands[2].bandId).toEqual('LEFT_TIBIA_NULL');
    expect(sortedBands[3].bandId).toEqual('LEFT_TARSUS');
    expect(sortedBands[4].bandId).toEqual('RIGHT_TIBIA');
    expect(sortedBands[5].bandId).toEqual('RIGHT_TARSUS');
  });
});

const testBands: Band[] = [
  {
    bandId: 'RIGHT_TARSUS',
    locationIndex: null,
    leg: 'Right',
    bandingPosition: 'Tarsus',
    bandType: 'COLOUR',
    colour: 'YELLOW',
    textColour: '',
    markForm: '',
    markFixing: ''
  },
  {
    bandId: 'LEFT_TARSUS',
    locationIndex: null,
    leg: 'Left',
    bandingPosition: 'Tarsus',
    bandType: 'COLOUR',
    colour: 'YELLOW',
    textColour: '',
    markForm: '',
    markFixing: ''
  },
  {
    bandId: 'RIGHT_TIBIA',
    locationIndex: null,
    leg: 'Right',
    bandingPosition: 'TIBIA',
    bandType: 'COLOUR',
    colour: 'YELLOW',
    textColour: '',
    markForm: '',
    markFixing: ''
  },
  {
    bandId: 'LEFT_TIBIA_NULL',
    locationIndex: null,
    leg: 'LEFT',
    bandingPosition: 'Tibia',
    bandType: 'COLOUR',
    colour: 'YELLOW',
    textColour: '',
    markForm: '',
    markFixing: ''
  },
  {
    bandId: 'LEFT_TIBIA_1',
    locationIndex: 1,
    leg: 'Left',
    bandingPosition: 'Tibia',
    bandType: 'COLOUR',
    colour: 'YELLOW',
    textColour: '',
    markForm: '',
    markFixing: ''
  },
  {
    bandId: 'LEFT_TIBIA_20',
    locationIndex: 20,
    leg: 'Left',
    bandingPosition: 'Tibia',
    bandType: 'COLOUR',
    colour: 'YELLOW',
    textColour: '',
    markForm: '',
    markFixing: ''
  }
];
