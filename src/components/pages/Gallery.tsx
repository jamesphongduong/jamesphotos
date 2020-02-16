import React, { Fragment, PureComponent } from 'react';
import { PhotoCard, AppContextConsumer } from '..';
import { getPhotos, putPhoto, deletePhoto, getAlbums } from '../../api';
import { numOrUndefined, Photo } from '../../types';
import { Fab, Tabs, Tab } from '@material-ui/core';
import { Edit, Save } from '@material-ui/icons';
import {
  filterArray,
  alertSuccessful,
  updateArray,
  addIdToObjectsArray
} from '../../utils';

interface State {
  photos: Photo[];
  editMode: boolean;
  editMade: boolean;
  idsEdited: number[];
  idsDeleted: number[];
  albumSelected: number;
  albums: string[];
}

interface Props {}

export class Gallery extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      photos: [],
      editMode: false,
      editMade: false,
      idsEdited: [],
      idsDeleted: [],
      albums: ['All'],
      albumSelected: 0
    };
  }

  componentDidMount(): void {
    getPhotos().then((res) => {
      console.log('res', res);
      this.setState({ photos: addIdToObjectsArray(res.data) }, () =>
        console.log('here', this.state.photos)
      );
    });
    getAlbums().then((res) => {
      console.log('123', res);
      this.setState((prevState) => ({
        albums: [...prevState.albums, ...res.data.sort()]
      }));
    });
  }

  onPhotoEdit = (id: number, prop: string, newValue: string): void => {
    const args = { matcher: id, newValue, prop };
    const updatedPhotoList = updateArray(this.state.photos, args);

    this.setState((prevState) => ({
      photos: updatedPhotoList,
      editMade: true,
      idsEdited: [...prevState.idsEdited, id]
    }));
  };

  onPhotoDelete = (id: number): void => {
    const { photos } = this.state;
    const newPhotos = [...photos].filter((photo) => photo.id !== id);

    this.setState((prevState) => ({
      photos: newPhotos,
      idsDeleted: [...prevState.idsDeleted, id],
      editMade: true
    }));
  };

  toggleEdit = (): void => {
    this.setState((prevState) => ({
      editMode: !prevState.editMode
    }));
  };

  onSave = async (): Promise<void> => {
    const { idsEdited, idsDeleted, photos } = this.state;
    const idsEditedFiltered = filterArray(idsEdited, idsDeleted);
    const editPromises = idsEditedFiltered.map((id) => {
      const photo = photos.find((photo) => photo.id === id);
      if (photo) {
        const { caption, imageURL, album } = photo;
        return putPhoto(id, { caption, imageURL, album });
      }
      return null;
    });

    const deletePromises = idsDeleted.map((id) => {
      return deletePhoto(id);
    });

    await Promise.all([editPromises, deletePromises])
      .then((res) => {
        alertSuccessful('Changes successful.');
        console.log('all promises completed');

        this.setState({
          idsEdited: [],
          idsDeleted: [],
          editMode: false,
          editMade: false
        });
      })
      .catch((err) => console.log('promise err', err));
  };

  renderEditOptions = (): JSX.Element => {
    const { editMode, editMade } = this.state;

    return (
      <Fragment>
        <Fab
          onClick={this.toggleEdit}
          color="secondary"
          aria-label="edit"
          size="medium"
        >
          <Edit />
        </Fab>
        {editMode && editMade && (
          <Fab
            onClick={this.onSave}
            color="secondary"
            aria-label="save"
            size="medium"
          >
            <Save />
          </Fab>
        )}
      </Fragment>
    );
  };

  renderAlbumOptions = (): JSX.Element => {
    const { albumSelected, albums } = this.state;
    return (
      <Tabs
        value={albumSelected}
        onChange={(e, newValue) => this.setState({ albumSelected: newValue })}
        aria-label="simple tabs example"
        style={styles.tabsContainer}
      >
        {albums.map((album) => (
          <Tab label={album} key={album} />
        ))}
      </Tabs>
    );
  };

  renderGallery = (): JSX.Element[] => {
    const { photos, editMode, albumSelected, albums } = this.state;

    const filteredPhotos =
      albumSelected === 0
        ? photos
        : photos.filter((photo) => photo.album === albums[albumSelected]);

    return filteredPhotos.map(
      (photo: Photo): JSX.Element => {
        console.log('photo');
        return (
          <PhotoCard
            onDeleteMade={this.onPhotoDelete}
            editMode={editMode}
            key={photo.id}
            caption={photo.caption}
            imageURL={photo.imageURL}
            id={photo.id}
            album={photo.album}
            onEdit={this.onPhotoEdit}
          />
        );
      }
    );
  };

  render(): JSX.Element {
    console.log('render');
    return (
      <AppContextConsumer>
        {(context) => (
          <Fragment>
            {context && context.state.loggedIn && this.renderEditOptions()}
            {this.renderAlbumOptions()}
            <div style={styles.container}>{this.renderGallery()}</div>
          </Fragment>
        )}
      </AppContextConsumer>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row' as 'row',
    flexWrap: 'wrap' as 'wrap',
    // justifyContent: 'center',
    alignItems: 'center'
  },
  tabsContainer: {
    margin: 16
  }
};
