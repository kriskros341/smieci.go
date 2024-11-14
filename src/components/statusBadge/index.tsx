import { Badge } from "@ui/badge"
import { View, Text } from "react-native"

type StatusBadgeProps = {
  pendingVerificationsCount: number
}

const StatusBadge = (props: StatusBadgeProps) => {
  let component
  if (props?.pendingVerificationsCount === -1) {
    component = (
      <Badge className="bg-green-600">
        <Text>Zaakcpetowany</Text>
      </Badge>
    )
  }
  if (props?.pendingVerificationsCount > 0) {
    component =  (
      <Badge className="bg-yellow-600">
        <Text>Oczekuje weryfikacji</Text>
      </Badge>
    )
  }

  if (props?.pendingVerificationsCount === 0) {
    component =  (
      <Badge className="bg-blue-600">
        <Text>Otwarty</Text>
      </Badge>
    )
  }

  return (
    <View className="justify-end">
      {component}
    </View>
  )
}

export default StatusBadge