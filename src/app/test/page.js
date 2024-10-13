"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

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

export default function AutoGrid() {
  return (
    <Container maxWidth="lg">
      <Grid container>
        <Grid item xs>
          <Item>xs</Item>
          <Item>xs</Item>
          <Item>xs</Item>
          <Item>xs</Item>
        </Grid>
        <Grid item xs sx={{ background: "red", borderRadius: "50%" }}>
          <Item>xs=6</Item>
        </Grid>
        <Grid item xs>
          <Item>xs</Item>
          <Item>xs</Item>
          <Item>xs</Item>
          <Item>xs</Item>
          <Item>xs</Item>
        </Grid>
      </Grid>
    </Container>
  );
}
