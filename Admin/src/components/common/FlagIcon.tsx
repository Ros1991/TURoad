import React from 'react';
import ReactCountryFlag from 'react-country-flag';

interface FlagIconProps {
  country: 'br' | 'us' | 'es';
  size?: 'sm' | 'md' | 'lg';
}

const FlagIcon: React.FC<FlagIconProps> = ({ country, size = 'md' }) => {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  const countryCodeMap = {
    br: 'BR',
    us: 'US',
    es: 'ES'
  };

  const countryNames = {
    br: 'Português (Brasil)',
    us: 'English',
    es: 'Español'
  };

  return (
    <div className="inline-flex items-center justify-center" title={countryNames[country]}>
      <ReactCountryFlag
        countryCode={countryCodeMap[country]}
        svg
        style={{
          width: `${sizeMap[size]}px`,
          height: `${Math.floor(sizeMap[size] * 0.75)}px`, // 4:3 ratio for rectangular flags
          borderRadius: '2px'
        }}
      />
    </div>
  );
};

export default FlagIcon;
