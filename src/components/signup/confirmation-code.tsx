// import { useSignUp } from "@clerk/clerk-expo";
// import { useMutation } from "@tanstack/react-query";
// import * as React from "react";
// import { Button, TextInput, View } from "react-native";
// import { _createUser } from "@api/users";
// import { useAxios } from "@hooks/use-axios";

// interface Props {
//   email: string;
//   username: string;
//   goBack: () => void;
// }

// const ConfirmationCode: React.FC<Props> = ({ email, username, goBack }) => {

//   return (
//     <View className="gap-8 p-4">
//       <View>
//         <TextInput
//           value={code}
//           placeholder="Code..."
//           onChangeText={(code) => setCode(code)}
//         />
//       </View>
//       <Button
//         title="Verify Email"
//         disabled={isLoading}
//         onPress={onPressVerify}
//       />
//       <Button
//         title="back"
//         onPress={goBack}
//       />
//     </View>
//   );
// };

// export default ConfirmationCode;
