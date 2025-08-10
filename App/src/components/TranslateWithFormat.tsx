import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from './index';
import { TextStyle } from 'react-native';

interface Props {
  i18nKey: string;
  style?: TextStyle;
  textStyle?: TextStyle;
  boldStyle?: TextStyle;
}

const TranslateWithFormat: React.FC<Props> = ({ i18nKey, style, textStyle, boldStyle }) => {
  const { t } = useTranslation();
  const text = t(i18nKey);
  
  // Se o texto não contém tags <b>, renderiza texto normal
  if (!text.includes('<b>') || !text.includes('</b>')) {
    return <Text style={style}>{text}</Text>;
  }
  
  // Processar tags <b> e dividir o texto em partes
  const parts: ReactNode[] = [];
  const regex = /<b>(.*?)<\/b>/g;
  let lastIndex = 0;
  let match;
  let partIndex = 0;
  
  while ((match = regex.exec(text)) !== null) {
    // Adiciona o texto antes da tag <b>
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(
        <Text key={`text-${partIndex}`} style={textStyle}>
          {beforeText}
        </Text>
      );
      partIndex++;
    }
    
    // Adiciona o texto em negrito (conteúdo da tag <b>)
    parts.push(
      <Text key={`bold-${partIndex}`} style={[textStyle, boldStyle, { fontWeight: '700' }]}>
        {match[1]}
      </Text>
    );
    partIndex++;
    
    lastIndex = regex.lastIndex;
  }
  
  // Adiciona o restante do texto após a última tag <b>
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    parts.push(
      <Text key={`final-text-${partIndex}`} style={textStyle}>
        {remainingText}
      </Text>
    );
  }
  
  return (
    <Text style={style}>
      {parts}
    </Text>
  );
};

export default TranslateWithFormat;
