import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Logo from "../assets/Logo.svg";
import Mail from "../assets/mail-icon.svg";
import Password from "../assets/password-icon.svg";

const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  birthdate: Yup.string()
    .matches(
      /^\d{2}\/\d{2}\/\d{4}$/,
      "Date of birth must be in the format DD/MM/YYYY"
    )
    .required("Required"),
});

const Signup = ({ navigation }) => {
  const [step, setStep] = useState(1);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const logoWidth = windowWidth * 0.4;
  const logoHeight = windowHeight * 0.2;

  const handleSignup = async (values) => {
    try {
      // Convertir la date au format YYYY-MM-DD
      const [day, month, year] = values.birthdate.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      const response = await axios.post(
        "https://ilm-ai-backend-1a3893a877c9.herokuapp.com/users/signup/",
        {
          email: values.email,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          date_of_birth: formattedDate,
        }
      );
      // Handle successful signup
      navigation.navigate("Login");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup error: " + error.response.data.detail);
    }
  };

  const formatBirthdate = (text) => {
    // Remove all non-digit characters
    let cleaned = text.replace(/[^\d]/g, "");

    // Format the text with slashes
    let formatted = "";
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
        2,
        4
      )}/${cleaned.slice(4, 8)}`;
    }

    return formatted;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Logo width={logoWidth} height={logoHeight} />
        <Text style={styles.title}>Inscription</Text>
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            birthdate: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <>
              {step === 1 && (
                <>
                  <Text style={styles.label}>Adresse email</Text>
                  <View style={styles.fields}>
                    <Mail />
                    <TextInput
                      style={styles.input}
                      placeholder="nom@mail.com"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && touched.email ? (
                    <Text style={styles.error}>{errors.email}</Text>
                  ) : null}

                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={styles.fields}>
                    <Password />
                    <TextInput
                      style={styles.input}
                      placeholder="Abcde95**$"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry={true}
                    />
                  </View>
                  {errors.password && touched.password ? (
                    <Text style={styles.error}>{errors.password}</Text>
                  ) : null}

                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <View style={styles.fields}>
                    <Password />
                    <TextInput
                      style={styles.input}
                      placeholder="Abcde95**$"
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      secureTextEntry={true}
                    />
                  </View>
                  {errors.confirmPassword && touched.confirmPassword ? (
                    <Text style={styles.error}>{errors.confirmPassword}</Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.connexion}
                    onPress={() => setStep(2)}
                  >
                    <Text style={styles.connexionText}>Continuer</Text>
                  </TouchableOpacity>
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={styles.label}>Prénom</Text>
                  <View style={styles.fields}>
                    <TextInput
                      style={styles.input}
                      placeholder="Prénom"
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                    />
                  </View>
                  {errors.firstName && touched.firstName ? (
                    <Text style={styles.error}>{errors.firstName}</Text>
                  ) : null}

                  <Text style={styles.label}>Nom</Text>
                  <View style={styles.fields}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nom"
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                    />
                  </View>
                  {errors.lastName && touched.lastName ? (
                    <Text style={styles.error}>{errors.lastName}</Text>
                  ) : null}

                  <Text style={styles.label}>Date de naissance</Text>
                  <View style={styles.fields}>
                    <TextInput
                      style={styles.input}
                      placeholder="JJ/MM/AAAA"
                      value={values.birthdate}
                      onChangeText={(text) =>
                        setFieldValue("birthdate", formatBirthdate(text))
                      }
                      onBlur={handleBlur("birthdate")}
                      keyboardType="numeric"
                      maxLength={10} // DD/MM/YYYY
                    />
                  </View>
                  {errors.birthdate && touched.birthdate ? (
                    <Text style={styles.error}>{errors.birthdate}</Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.connexion}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.connexionText}>S'inscrire</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep(1)}
                  >
                    <Text style={styles.backButtonText}>Retour</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </Formik>

        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={styles.login}
            onPress={() => navigation.navigate("Login")}
          >
            <Text>
              <Text>Déjà un compte ? Connectez-vous</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#323533",
  },
  input: {
    width: "100%",
    height: 50,
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  buttonSpacer: {
    height: "20%", // Espace entre les boutons, ajustez selon vos besoins
  },
  label: {
    alignSelf: "left",
    marginLeft: 5,
    marginBottom: 5,
    color: "#323533",
    fontSize: 16,
  },
  fields: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F3F3F3",
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  connexion: {
    backgroundColor: "#45B172", // Fond vert
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 80,
    width: "100%",
    marginTop: 20,
    height: 60,
  },
  connexionText: {
    color: "white", // Couleur du texte spécifique
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomButton: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  login: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 80,
    width: "100%",
    marginTop: 20,
    height: 60,
    borderWidth: 0.5,
    borderColor: "#45B172",
    marginVertical: 15,
  },
  error: {
    color: "red",
    fontSize: 14,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  backButton: {
    backgroundColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 80,
    width: "100%",
    marginTop: 20,
    height: 60,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Signup;
