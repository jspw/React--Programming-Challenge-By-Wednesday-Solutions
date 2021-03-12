import React, { useEffect, memo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { Card, Skeleton, Input } from 'antd';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import T from '@components/T';
import Clickable from '@components/Clickable';
import { useInjectSaga } from 'utils/injectSaga';
import { selectHomeContainer, selectSongsData, selectSongsError, selectArtistName } from './selectors';
import { homeContainerCreators } from './reducer';
import saga from './saga';

const { Search } = Input;

const CustomCard = styled(Card)`
  && {
    margin: 20px 0;
    max-width: ${props => props.maxwidth};
    color: ${props => props.color};
    ${props => props.color && `color: ${props.color}`};
  }
`;
const Container = styled.div`
  && {
    display: flex;
    flex-direction: column;
    max-width: ${props => props.maxwidth}px;
    width: 100%;
    margin: 0 auto;
    padding: ${props => props.padding}px;
  }
`;
const RightContent = styled.div`
  display: flex;
  align-self: flex-end;
`;
export function HomeContainer({
  dispatchItunesSongs,
  dispatchClearItunesSongs,
  intl,
  songsData = {},
  reposError = null,
  artistName,
  maxwidth,
  padding
}) {
  useInjectSaga({ key: 'homeContainer', saga });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loaded = get(songsData, 'results', null) || reposError;
    console.log('songsData', songsData);
    if (loading && loaded) {
      setLoading(false);
    }
  }, [songsData]);

  useEffect(() => {
    if (artistName && !songsData?.results?.length) {
      dispatchItunesSongs(artistName);
      setLoading(true);
    }
  }, []);

  const history = useHistory();

  const handleOnChange = rName => {
    if (!isEmpty(rName)) {
      dispatchItunesSongs(rName);
      setLoading(true);
    } else {
      dispatchClearItunesSongs();
    }
  };
  const debouncedHandleOnChange = debounce(handleOnChange, 200);

  const renderSongList = () => {
    const results = get(songsData, 'results', []);
    console.log('Songs data', songsData);
    const resultCount = get(songsData, 'resultCount', 0);
    return (
      (results.length !== 0 || loading) && (
        <CustomCard>
          <Skeleton loading={loading} active>
            {artistName && (
              <div>
                <b> Artist Query : </b>
                <a style={{ color: 'blue' }} href={results[1].artistViewUrl}>
                  {results[1].artistName}
                </a>
              </div>
            )}
            {resultCount !== 0 && (
              <div>
                <T id="matching_repos" values={{ totalCount: resultCount }} />
              </div>
            )}
            {results.map((item, index) => (
              <CustomCard key={index}>
                <T id="song_name" values={{ songName: item.trackName }} />
                <T id="song_full_name" values={{ fullName: item.collectionName }} />
                <T id="primary_genre_name" values={{ primaryGenreName: item.primaryGenreName }} />
                <T id="track_price" values={{ trackPrice: item.trackPrice }} />
                <T id="release_date" values={{ releaseDate: new Date(item.releaseDate).toDateString() }} />
                <T
                  id="track_time"
                  values={{
                    trackTime:
                      Math.round(item.trackTimeMillis / 1000 / 60) +
                      ' min' +
                      ' ' +
                      Math.round((item.trackTimeMillis / 1000) % 60) +
                      ' sec'
                  }}
                />
              </CustomCard>
            ))}
          </Skeleton>
        </CustomCard>
      )
    );
  };
  const renderErrorState = () => {
    let repoError;
    if (reposError) {
      console.log(repoError);
      repoError = reposError;
    } else if (!get(songsData, 'resultCount', 0)) {
      repoError = 'repo_search_default';
    }
    return (
      !loading &&
      repoError && (
        <CustomCard color={reposError ? 'red' : 'grey'} title={intl.formatMessage({ id: 'repo_list' })}>
          <T id={repoError} />
        </CustomCard>
      )
    );
  };
  const refreshPage = () => {
    history.push('stories');
    window.location.reload();
  };
  return (
    <Container maxwidth={maxwidth} padding={padding}>
      <RightContent>
        <Clickable textId="stories" onClick={refreshPage} />
      </RightContent>
      <CustomCard title={intl.formatMessage({ id: 'repo_search' })} maxwidth={maxwidth}>
        <T marginBottom={10} id="get_repo_details" />
        <Search
          data-testid="search-bar"
          defaultValue={artistName}
          type="text"
          onChange={evt => debouncedHandleOnChange(evt.target.value)}
          onSearch={searchText => debouncedHandleOnChange(searchText)}
        />
      </CustomCard>
      {renderSongList()}
      {renderErrorState()}
    </Container>
  );
}

HomeContainer.propTypes = {
  dispatchItunesSongs: PropTypes.func,
  dispatchClearItunesSongs: PropTypes.func,
  intl: PropTypes.object,
  songsData: PropTypes.shape({
    resultCount: PropTypes.number,
    incompleteResults: PropTypes.bool,
    results: PropTypes.array
  }),
  reposError: PropTypes.object,
  artistName: PropTypes.string,
  history: PropTypes.object,
  maxwidth: PropTypes.number,
  padding: PropTypes.number
};

HomeContainer.defaultProps = {
  maxwidth: 500,
  padding: 20
};

const mapStateToProps = createStructuredSelector({
  homeContainer: selectHomeContainer(),
  songsData: selectSongsData(),
  reposError: selectSongsError(),
  artistName: selectArtistName()
});

function mapDispatchToProps(dispatch) {
  const { requestGetItunesSongs, clearItunesSongs } = homeContainerCreators;
  return {
    dispatchItunesSongs: artistName => dispatch(requestGetItunesSongs(artistName)),
    dispatchClearItunesSongs: () => dispatch(clearItunesSongs())
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  injectIntl,
  withConnect,
  memo
)(HomeContainer);

export const HomeContainerTest = compose(injectIntl)(HomeContainer);
