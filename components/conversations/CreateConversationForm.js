import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Flex, Box } from '@rebass/grid';
import { useMutation } from '@apollo/react-hooks';

import { gqlV2, API_V2_CONTEXT } from '../../lib/graphql/helpers';
import { getErrorFromGraphqlException } from '../../lib/errors';
import StyledInput from '../StyledInput';
import RichTextEditor from '../RichTextEditor';
import StyledButton from '../StyledButton';
import MessageBox from '../MessageBox';
import LoadingPlaceholder from '../LoadingPlaceholder';
import { P, H4 } from '../Text';
import StyledInputTags from '../StyledInputTags';
import CreateConversationFAQ from '../faqs/CreateConversationFAQ';

const CreateConversationMutation = gqlV2`
  mutation CreateConversation($title: String!, $html: String!, $CollectiveId: String!, $tags: [String]) {
    createConversation(title: $title, html: $html, CollectiveId: $CollectiveId, tags: $tags) {
      id
      slug
      title
      summary
      tags
      createdAt
    }
  }
`;

const mutationOptions = { context: API_V2_CONTEXT };

const messages = defineMessages({
  titlePlaceholder: {
    id: 'CreateConversation.Title.Placeholder',
    defaultMessage: 'Start with a title for your conversation here',
  },
  bodyPlaceholder: {
    id: 'CreateConversation.Body.Placeholder',
    defaultMessage:
      'You can add links, lists, code snipets and more using this text editor. Type and start adding content to your conversation here.',
  },
});

const initialFormState = {
  html: '',
  tags: [],
  title: '',
  errors: {},
  isSubmitting: false,
};

const reducer = (state, { field, value }) => {
  return {
    ...state,
    [field]: value,
  };
};

const validate = state => {
  const { title, html } = state;
  const errors = {};
  if (!title) {
    errors.title = { type: 'required' };
  } else if (title.length < 3) {
    errors.title = { type: 'minLength' };
  } else if (title.length > 255) {
    errors.title = { type: 'maxLength' };
  }

  if (!html) {
    errors.html = { type: 'required' };
  }

  return errors;
};

/**
 * Form to create a new conversation. User must be authenticated.
 *
 * /!\ Can only be used with data from API V2.
 */
const CreateConversationForm = ({ collectiveId, suggestedTags, onSuccess, disabled, loading }) => {
  const { formatMessage } = useIntl();
  const [createConversation, { error: submitError }] = useMutation(CreateConversationMutation, mutationOptions);
  const [state, dispatch] = useReducer(reducer, initialFormState);
  const { title, html, tags, errors, isSubmitting } = state;

  useEffect(() => {
    if (Object.keys(errors).length === 0 && isSubmitting) {
      submitForm(title, html, tags);
    }
  }, [errors]);

  const validateSubmit = event => {
    event.preventDefault();
    dispatch({ field: 'errors', value: validate(state) });
    dispatch({ field: 'isSubmitting', value: true });
  };

  const submitForm = async (titleField, htmlField, tagsField) => {
    const response = await createConversation({
      variables: { title: titleField, html: htmlField, tags: tagsField, CollectiveId: collectiveId },
    });
    return onSuccess(response.data.createConversation);
  };

  return (
    <form onSubmit={validateSubmit}>
      <Flex flexWrap="wrap">
        <Box flex={['1 1 100%', null, null, '1 1']}>
          {loading ? (
            <LoadingPlaceholder height={36} />
          ) : (
            <StyledInput
              bare
              data-cy="conversation-title-input"
              error={errors.title}
              withOutline
              width="100%"
              fontSize="H4"
              border="none"
              name="title"
              maxLength={255}
              px={0}
              py={0}
              placeholder={formatMessage(messages.titlePlaceholder)}
              value={title}
              onChange={e => dispatch({ field: 'title', value: e.target.value })}
            />
          )}
          {errors.title && (
            <P color="red.500" mt={3}>
              {errors.title.type === 'required' && (
                <FormattedMessage id="Error.FieldRequired" defaultMessage="This field is required" />
              )}
              {errors.title.type === 'minLength' && (
                <FormattedMessage
                  id="Error.MinLength"
                  defaultMessage="Length must be more than {length}"
                  values={{ length: 2 }}
                />
              )}
              {errors.title.type === 'maxLength' && (
                <FormattedMessage
                  id="Error.MaxLength"
                  defaultMessage="Length must be less than {length}"
                  values={{ length: 256 }}
                />
              )}
            </P>
          )}
          <Box my={3}>
            {loading ? (
              <LoadingPlaceholder height={228} />
            ) : (
              <RichTextEditor
                withStickyToolbar
                toolbarOffsetY={0}
                placeholder={formatMessage(messages.bodyPlaceholder)}
                editorMinHeight={225}
                inputName="html"
                fontSize="13px"
                onChange={e => dispatch({ field: 'html', value: e.target.value })}
                error={errors.title}
              />
            )}
          </Box>
          {errors.html && (
            <P color="red.500" mt={3}>
              <FormattedMessage id="Error.FieldRequired" defaultMessage="This field is required" />
            </P>
          )}
        </Box>
        <Box flex="0 1 300px" ml={[null, null, null, 4]}>
          <Box mb={4}>
            <H4 fontWeight="normal" mb={2}>
              <FormattedMessage id="Tags" defaultMessage="Tags" />
            </H4>
            <Box>
              {loading ? (
                <LoadingPlaceholder height={38} />
              ) : (
                <StyledInputTags
                  maxWidth={300}
                  suggestedTags={suggestedTags}
                  onChange={options =>
                    dispatch({
                      field: 'tags',
                      value: options && options.length > 0 ? options.map(option => option.value) : null,
                    })
                  }
                />
              )}
            </Box>
          </Box>
          <Box display={['none', null, null, 'block']}>
            <H4 fontWeight="normal" mb={2}>
              <FormattedMessage id="FAQ" defaultMessage="FAQ" />
            </H4>
            <CreateConversationFAQ title={null} withBorderLeft />
          </Box>
        </Box>
      </Flex>
      {submitError && (
        <MessageBox type="error" mt={3}>
          {getErrorFromGraphqlException(submitError).message}
        </MessageBox>
      )}
      <StyledButton
        type="submit"
        buttonStyle="primary"
        data-cy="submit-new-conversation-btn"
        disabled={disabled || loading}
        minWidth={200}
        mt={3}
      >
        <FormattedMessage id="CreateConversationForm.Submit" defaultMessage="Submit conversation" />
      </StyledButton>
    </form>
  );
};

CreateConversationForm.propTypes = {
  /** ID of the collective where the conversation will be created */
  collectiveId: PropTypes.string.isRequired,
  /** Called when the conversation gets successfully created. Return a promise if you want to keep the submitting state active. */
  onSuccess: PropTypes.func.isRequired,
  /** Will disable the form */
  disabled: PropTypes.bool,
  /** Will show a loading state. Use this if loggedInUser or required data is not loaded yet. */
  loading: PropTypes.bool,
  /** Tags suggested for this new conversation */
  suggestedTags: PropTypes.arrayOf(PropTypes.string),
};

export default CreateConversationForm;
