
import React from "react";
import { SQLiteProvider } from "expo-sqlite";

const withSQLiteProvider = (Component) => {
  return (props) => (
    <SQLiteProvider
      databaseName="coran.db"
      assetSource={{ assetId: require("../../assets/coran.db") }}
    >
      <Component {...props} />
    </SQLiteProvider>
  );
};

export default withSQLiteProvider;
