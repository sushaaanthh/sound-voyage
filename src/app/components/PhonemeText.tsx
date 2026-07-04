import React from 'react';
import { PHONEME_AUDIO_MAP } from '../../data/phonemeAudioMap';

export interface PhonemeTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  phoneme: string;
}

export const PhonemeText: React.FC<PhonemeTextProps> = ({ phoneme, className = '', ...props }) => {
  const mappedSound = PHONEME_AUDIO_MAP[phoneme] || PHONEME_AUDIO_MAP[phoneme.trim()];
  const ariaLabelText = mappedSound ? `, ${mappedSound}, ` : phoneme;

  return (
    <span
      aria-label={ariaLabelText}
      aria-hidden="false"
      className={className}
      {...props}
    >
      {phoneme}
    </span>
  );
};

export default PhonemeText;
