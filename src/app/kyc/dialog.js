import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {useEffect} from "react";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
    justifyContent: 'center',
    backgroundColor: theme.palette.primary.main,
  },
  "& .MuiTypography-root":{
    textAlign:"left !important",
  },
  "& .MuiButton-root":{
    color: theme.palette.common.white,
  },
  "& .MuiPaper-root": {
    backgroundColor: "rgba(255, 255, 255,0.88)",
    zIndex: "300",
    width: "300px",
    maxWidth: "300px",
    borderRadius: "10px",
    boxShadow: theme.shadows[9],
    marginRight:"10px",
  },
}));

export default function CustomizedDialogs({ open, setOpen , text , isButton ,handleClose}) {
  const close = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <BootstrapDialog aria-labelledby="customized-dialog-title" open={open}>
        <DialogContent dividers>
          <Typography gutterBottom>
            {text}
          </Typography>
          <Typography gutterBottom>
           با تشکر
          </Typography>
        </DialogContent>
        {isButton &&<DialogActions>
           <Button autoFocus onClick={close}>
          متوجه شدم
        </Button>
        </DialogActions>}
      </BootstrapDialog>
    </React.Fragment>
  );
}
