import { Badge } from "@ui/badge";
import * as React from "react";
import { Text, View } from "react-native";

type StatusBadgeProps = {
  status: "pending" | "approved" | "denied";
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let component;
  if (status === "approved") {
    component = (
      <Badge className="bg-green">
        <Text className="text-emerald-100">Zaakceptowany</Text>
      </Badge>
    );
  }
  if (status === "pending") {
    component = (
      <Badge className="bg-yellow-600">
        <Text className="text-yellow-100">Oczekuje weryfikacji</Text>
      </Badge>
    );
  }

  if (status === "denied") {
    component = (
      <Badge className="bg-blue-600">
        <Text className="text-blue-100">Odrzucony</Text>
      </Badge>
    );
  }

  return <View className="justify-end">{component}</View>;
};

export default StatusBadge;
