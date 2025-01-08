import { Badge } from "@ui/badge";
import * as React from "react";
import { Text, View } from "react-native";

type Status = 'pending' | 'approved' | 'denied'

type SolutionStatusBadgeProps = {
  status: Status;
};

const SolutionStatusBadge: React.FC<SolutionStatusBadgeProps> = ({ status }) => {
  let component;
  if (status === 'approved') {
    component = (
      <Badge className="bg-green">
        <Text className="text-emerald-100">Rozwiązanie zaakcpetowane</Text>
      </Badge>
    );
  }
  if (status === "pending") {
    component = (
      <Badge className="bg-blue-600">
        <Text className="text-yellow-100">Czeka na śmiałków</Text>
      </Badge>
    );
  }

  if (status === "denied") {
    component = (
      <Badge className="bg-red-600">
        <Text className="text-blue-100">Rozwiązanie Odrzucone</Text>
      </Badge>
    );
  }

  return <View className="justify-end shadow-lg">{component}</View>;
};

export default SolutionStatusBadge;
