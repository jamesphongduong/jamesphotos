import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';
import { Card, CardMedia, Fab, Select, MenuItem } from '@material-ui/core';
import { CustomTextField } from './';
import { Photo } from '../types';
import { countries } from '../config/db.js';

interface PhotoProps extends Photo {
  editMode: boolean;
  onCaptionEdit: (id: number, input: string) => void;
  autoFocus: boolean;
  toggleEdit?: () => void;
  onEditMade: (id: number) => void;
  onDeleteMade: (id: number) => void;
  onEdit: (id: number, album: string) => void;
}

type Props = PhotoProps;

export const PhotoCard = (props: Props): JSX.Element => {
  const {
    caption,
    imageURL,
    id,
    onCaptionEdit,
    autoFocus,
    editMode,
    onEditMade,
    onDeleteMade,
    album,
    onEdit
  } = props;
  const classes = useStyles();

  const onInputChange = (e): void => {
    const { target } = e;

    // if album
    if (e.target.name === 'album') {
      if (e.target.value !== album) {
        if (id) onEdit(id, e.target.value);
        return;
      }
    }

    // if caption
    if (e.target.getAttribute('id') === 'caption') {
      if (id) {
        onCaptionEdit(id, target.value);
        return onEditMade(id);
      }
    }
  };

  const onDelete = (): void => {
    if (id) onDeleteMade(id);
  };

  const renderDeleteButton = (): JSX.Element => {
    return (
      <Fab
        onClick={onDelete}
        color="secondary"
        aria-label="delete"
        size="medium"
      >
        <Delete />
      </Fab>
    );
  };

  return (
    <Card className={classes.card} raised>
      <div>
        <div className={editMode ? classes.editButtonContainer : classes.hide}>
          {renderDeleteButton()}
        </div>
        <CardMedia className={classes.media} image={imageURL} />
      </div>
      <CustomTextField
        style={{ marginBottom: '0px' }}
        id="caption"
        fullWidth
        multiline
        value={caption}
        handleInput={onInputChange}
        autoFocus={autoFocus}
        InputProps={
          !editMode
            ? {
                readOnly: true,
                disableUnderline: true
              }
            : {}
        }
        inputProps={{
          maxLength: 40
        }}
      />
      {editMode && (
        <Select name="album" value={album} onChange={onInputChange}>
          {countries.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
      )}
    </Card>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    card: {
      position: 'relative',
      margin: 16,
      padding: 16,
      overflow: 'visible',
      alignSelf: 'flex-start'
    },
    media: {
      minHeight: 300,
      minWidth: 300
    },
    hideCaption: {
      display: 'none'
    },
    editButtonContainer: {
      position: 'absolute',
      right: '25px',
      top: '25px'
    },
    hide: {
      display: 'none'
    }
  })
);
