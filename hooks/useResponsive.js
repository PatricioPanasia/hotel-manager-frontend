import { useWindowDimensions } from 'react-native';

const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

export const useResponsive = () => {
  const { width } = useWindowDimensions();

  if (width < breakpoints.tablet) {
    return { device: 'mobile', width };
  }
  if (width < breakpoints.desktop) {
    return { device: 'tablet', width };
  }
  return { device: 'desktop', width };
};
