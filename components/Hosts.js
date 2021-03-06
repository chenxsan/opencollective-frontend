import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import Header from './Header';
import Body from './Body';
import Footer from './Footer';
import HostsWithData from './HostsWithData';

import Container from './Container';
import { H1, P } from './Text';
import Link from './Link';

const CoverSmallCTA = styled.span`
  a:hover {
    text-decoration: underline !important;
  }
`;

class Hosts extends React.Component {
  static propTypes = {
    collective: PropTypes.object,
    LoggedInUser: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { status: 'idle', result: {} };
    this.messages = defineMessages({
      'hosts.title': {
        id: 'hosts.title',
        defaultMessage: 'Open Collective Hosts',
      },
      'hosts.description': {
        id: 'hosts.description',
        defaultMessage:
          "Hosts are legal entities that collect money on behalf of open collectives so that they don't have to worry about accounting, taxes, etc. Some also provide extra services. {findOutMoreLink}",
      },
      'hosts.findOutMoreLink': {
        id: 'hosts.description.findOutMoreLink',
        defaultMessage: 'Find out more about becoming an Open Collective Host.',
      },
    });
  }

  render() {
    const { LoggedInUser, intl } = this.props;

    const title = intl.formatMessage(this.messages['hosts.title']);

    const findOutMoreMessage = intl.formatMessage(this.messages['hosts.findOutMoreLink']);

    const findOutMoreLink = (
      <CoverSmallCTA>
        <Link route="https://docs.opencollective.com/help/hosts/become-host">{findOutMoreMessage}</Link>
      </CoverSmallCTA>
    );

    const description = (
      <FormattedMessage
        id="hosts.description"
        defaultMessage="Hosts are legal entities that collect money on behalf of open collectives so that they don't have to worry about accounting, taxes, etc. Some also provide extra services. {findOutMoreLink}"
        values={{ findOutMoreLink }}
      />
    );

    return (
      <div className="Hosts">
        <style jsx>
          {`
            .success {
              color: green;
            }
            .error {
              color: red;
            }
            .login {
              text-align: center;
            }
            .actions {
              text-align: center;
              margin-bottom: 5rem;
            }
          `}
        </style>

        <Header
          title={title}
          description={description}
          twitterHandle="opencollect"
          className={this.state.status}
          LoggedInUser={LoggedInUser}
        />

        <Body>
          <Container mt={2} mb={2}>
            <H1 fontSize={['H4', 'H2']} lineHeight={3} fontWeight="bold" textAlign="center" color="black.900">
              {title}
            </H1>
            <P textAlign="center">{description}</P>
          </Container>

          <div className="content">
            <HostsWithData LoggedInUser={LoggedInUser} />
          </div>
        </Body>
        <Footer />
      </div>
    );
  }
}

export default injectIntl(Hosts);
