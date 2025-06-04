

import React, { createContext, useState } from "react";

export const InitialQuestionContext = createContext();

export const InitialQuestionProvider = ({ children }) => {
  const [initialQuestion, setInitialQuestion] = useState(null);
  const [initialQuestionSent, setInitialQuestionSent] = useState(false);
  


  return (
    <InitialQuestionContext.Provider
      value={{
        initialQuestion,
        setInitialQuestion,
        initialQuestionSent,
        setInitialQuestionSent,
      }}
    >
      {children}
    </InitialQuestionContext.Provider>
  );
};
