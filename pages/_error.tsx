import React from "react";
import NextError from "next/error";

import NotFound from "../components/StructuralElement/not-found";
import GeneralError from "../components/StructuralElement/error";

function ErrorPage({ statusCode }) {
  if (statusCode >= 400 && statusCode < 500) return <NotFound />;
  else if (statusCode >= 500 && statusCode < 600) return <GeneralError />;
  else return <NextError statusCode={statusCode} />;
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
