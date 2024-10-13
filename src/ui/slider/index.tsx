import * as React from 'react';
import { View, Text, Platform } from 'react-native';
import * as SliderBase from '@rn-primitives/slider';

function Slider() {
  const [value, setValue] = React.useState(50);

  return (
    <View >
      <Text>{Math.round(value)}</Text>
      <SliderBase.Root
        value={value}
        onValueChange={(vals) => {
          const nextValue = vals[0];
          if (typeof nextValue !== 'number') return;
          setValue(nextValue);
        }}
      >
        <SliderBase.Track>
          <SliderBase.Range
            style={{ width: `${value}%` }}
          />
          <SliderBase.Thumb
            style={{ left: `${value}%` }}
          />
        </SliderBase.Track>
      </SliderBase.Root>

      {Platform.OS !== 'web' && (
        <Text>
          You will have to implement the gesture handling
        </Text>
      )}
    </View>
  );
}

export default Slider;