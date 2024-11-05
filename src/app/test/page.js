"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import formDocSix from "./formsix.json";
import Paper from "@mui/material/Paper";
import createPdf from "./pdf";
import Grid from "@mui/material/Grid";
import { Button } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));
const handleClick = () => {
  const blobdata = createPdf(formDocSix);
  if (blobdata) {
    blobdata.then((e) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(e);
      link.download = `contract.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
};

export default function AutoGrid() {
  return (
    <Container maxWidth="lg">
      <Button onClick={handleClick}>handleClick</Button>
    </Container>
  );
}
