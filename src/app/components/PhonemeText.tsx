import React from 'react';
import { PHONEME_AUDIO_MAP } from '../../data/phonemeAudioMap';

export interface PhonemeTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  phoneme: string;
}

export const PhonemeText: React.FC<PhonemeTextProps> = ({ phoneme, className = '', ...props }) => {
  const mappedSound = PHONEME_AUDIO_MAP[phoneme] || PHONEME_AUDIO_MAP[phoneme.trim()];
  const ariaLabelText = mappedSound ? `, ${mappedSound}, ` : phoneme;

  // If phoneme is "/u_uh/", displayText becomes "/u/"
  const formatForDisplay = (rawPhoneme: string) => {
    if (rawPhoneme.includes('_')) {
      const base = rawPhoneme.split('_')[0]; // "/u"
      return base + '/'; // "/u/"
    }
    return rawPhoneme;
  };
  const displayText = formatForDisplay(phoneme);

  return (
    <span
      aria-label={ariaLabelText}
      aria-hidden="false"
      className={className}
      {...props}
    >
      {displayText}
    </span>
  );
};

export default PhonemeText;
