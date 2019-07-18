import React, { Component } from 'react';
import { Grid, Header, Input, List, Segment } from 'semantic-ui-react';
import Amplify, { graphqlOperation } from 'aws-amplify';
import aws_exports from './aws-exports';
import { withAuthenticator, Connect } from 'aws-amplify-react';

Amplify.configure(aws_exports);

// 2. NEW: Create a function we can use to 
//    sort an array of objects by a common property
function makeComparator(key, order = 'asc') {
  return (a, b) => {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;

    const aVal = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
    const bVal = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;

    return order === 'desc' ? (comparison * -1) : comparison
  };
}


// 3. NEW: Add an AlbumsList component for rendering 
//    a sorted list of album names
class AlbumsList extends React.Component {
  albumItems() {
    return this.props.albums.sort(makeComparator('name')).map(album =>
      <li key={album.id}>
        {album.name}
      </li>);
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>My Albums</Header>
        <List divided relaxed>
          {this.albumItems()}
        </List>
      </Segment>
    );
  }
}


// 4. NEW: Add a new string to query all albums
const ListAlbums = `query ListAlbums {
    listAlbums(limit: 9999) {
        items {
            id
            name
        }
    }
}`;


// 5. NEW: Add an AlbumsListLoader component that will use the 
//    Connect component from Amplify to provide data to AlbumsList
class AlbumsListLoader extends React.Component {
  render() {
    return (
      <Connect query={graphqlOperation(ListAlbums)}>
        {({ data, loading, errors }) => {
          if (loading) { return <div>Loading...</div>; }
          if (!data.listAlbums) return;

          return <AlbumsList albums={data.listAlbums.items} />;
        }}
      </Connect>
    );
  }
}


// 6. EDIT: Change the App component to look nicer and
//    use the AlbumsListLoader component
class App extends Component {
  render() {
    return (
      <Grid padded>
        <Grid.Column>
          <AlbumsListLoader />
        </Grid.Column>
      </Grid>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
