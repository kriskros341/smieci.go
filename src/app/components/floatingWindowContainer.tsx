
import { Modal, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';
import { Pressable } from 'react-native';
import { Text } from 'react-native';

const styles = StyleSheet.create({
  modalContent: {
    height: '100%',
    width: '100%',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    backgroundColor: '#464C55',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 16,
  },
});


// Coupled af but works
export default function FloatingWindowContainer({ visibilityState, children, onClose, title }: any) {
  if (visibilityState === 'hidden') {
    return;
  }

    <View className={cn(
    "absolute bottom-0 z-50 flex-1 w-full", 
    visibilityState === "minimal" && "h-64", 
    visibilityState === "fullscreen" && "h-full")}
      <View style={styles.modalContent} className="bg-slate-100">
        <View style={styles.titleContainer} className="h-8">
          <Text style={styles.title}>{ title }</Text>
          <Pressable onPress={onClose}>
            <MaterialIcons name="close" color="#fff" size={22} />
          </Pressable>
        </View>
        {children}
      </View>
    </View>
  )
}