

import { Platform } from 'react-native';

export const getOptimizedFlatListProps = () => {

  if (Platform.OS === 'web') {
    return {

      removeClippedSubviews: false, 
      maxToRenderPerBatch: 10,      
      updateCellsBatchingPeriod: 100, 
      windowSize: 5,                  
      initialNumToRender: 10,         
    };
  }

  return {

    removeClippedSubviews: true,    
    maxToRenderPerBatch: 50,        
    updateCellsBatchingPeriod: 50,  
    windowSize: 10,                  
    initialNumToRender: 20,          
  };
};
