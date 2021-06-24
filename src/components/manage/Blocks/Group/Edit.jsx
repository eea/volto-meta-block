import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import {
  BlocksForm,
  SidebarPortal,
  Icon,
  InlineForm,
} from '@plone/volto/components';
import { emptyBlocksForm } from '@plone/volto/helpers';
import delightedSVG from '@plone/volto/icons/delighted.svg';
import dissatisfiedSVG from '@plone/volto/icons/dissatisfied.svg';
import PropTypes from 'prop-types';
import { Button, Segment } from 'semantic-ui-react';
import EditBlockWrapper from './EditBlockWrapper';
import EditSchema from './EditSchema';
import helpSVG from '@plone/volto/icons/help.svg';
import cx from 'classnames';
import './editor.less';

const Edit = (props) => {
  const {
    block,
    data,
    onChangeBlock,
    onChangeField,
    pathname,
    selected,
    manage,
    formDescription,
  } = props;

  const metadata = props.metadata || props.properties;
  const properties = isEmpty(data?.data?.blocks)
    ? emptyBlocksForm()
    : data.data;

  const [selectedBlock, setSelectedBlock] = useState(
    properties.blocks_layout.items[0],
  );

  React.useEffect(() => {
    if (
      isEmpty(data?.data?.blocks) &&
      properties.blocks_layout.items[0] !== selectedBlock
    ) {
      setSelectedBlock(properties.blocks_layout.items[0]);
      onChangeBlock(block, {
        ...data,
        data: properties,
      });
    }
  }, [
    onChangeBlock,
    properties,
    selectedBlock,
    block,
    data,
    data?.data?.blocks,
  ]);

  const blockState = {};
  let charCount = 0;

  const countTextInBlocks = (blocksObject) => {
    let groupCharCount = 0;

    Object.keys(blocksObject).forEach((blockId) => {
      const charCountTemp = blocksObject[blockId]?.plaintext
        ? blocksObject[blockId]?.plaintext.length
        : blocksObject[blockId]?.text?.blocks[0]?.text
        ? blocksObject[blockId].text.blocks[0].text.length
        : blocksObject[blockId]?.data?.blocks
        ? countTextInBlocks(blocksObject[blockId]?.data?.blocks)
        : blocksObject[blockId]?.blocks
        ? countTextInBlocks(blocksObject[blockId]?.blocks)
        : 0;
      groupCharCount = groupCharCount + charCountTemp;
    });

    return groupCharCount;
  };

  const showCharCounter = () => {
    if (props.data?.data?.blocks) {
      charCount = countTextInBlocks(props.data?.data?.blocks);
    }
  };
  showCharCounter();

  const counterClass =
    charCount < Math.ceil(props.data.maxChars / 1.05)
      ? 'info'
      : charCount < props.data.maxChars
      ? 'warning'
      : 'danger';

  const counterComponent = props.data.maxChars ? (
    <p
      className={cx('counter', counterClass)}
      onClick={() => {
        setSelectedBlock();
        props.setSidebarTab(1);
      }}
      aria-hidden="true"
    >
      {props.data.maxChars - charCount < 0 ? (
        <>
          <span>{`${
            charCount - props.data.maxChars
          } characters over the limit`}</span>
          <Icon name={dissatisfiedSVG} size="24px" />
        </>
      ) : (
        <>
          <span>{`${
            props.data.maxChars - charCount
          } characters remaining out of ${props.data.maxChars}`}</span>
          <Icon name={delightedSVG} size="24px" />
        </>
      )}
    </p>
  ) : null;

  // Get editing instructions from block settings or props
  let instructions = data?.instructions?.data || data?.instructions;
  if (!instructions || instructions === '<p><br/></p>') {
    instructions = formDescription;
  }

  return (
    <fieldset className="section-block">
      <legend
        onClick={() => {
          setSelectedBlock();
          props.setSidebarTab(1);
        }}
        aria-hidden="true"
      >
        {data.title || 'Section'}
      </legend>
      <BlocksForm
        metadata={metadata}
        properties={properties}
        manage={manage}
        selectedBlock={selected ? selectedBlock : null}
        allowedBlocks={data.allowedBlocks}
        title={data.placeholder}
        description={instructions}
        onSelectBlock={(id) => {
          setSelectedBlock(id);
        }}
        onChangeFormData={(newFormData) => {
          onChangeBlock(block, {
            ...data,
            data: newFormData,
          });
        }}
        onChangeField={(id, value) => {
          if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
            blockState[id] = value;
            onChangeBlock(block, {
              ...data,
              data: {
                ...data.data,
                ...blockState,
              },
            });
          } else {
            onChangeField(id, value);
          }
        }}
        pathname={pathname}
      >
        {({ draginfo }, editBlock, blockProps) => (
          <EditBlockWrapper
            draginfo={draginfo}
            blockProps={blockProps}
            disabled={data.disableInnerButtons}
            extraControls={
              <>
                {instructions && (
                  <>
                    <Button
                      icon
                      basic
                      title="Section help"
                      onClick={() => {
                        setSelectedBlock();
                        const tab = manage ? 0 : 1;
                        props.setSidebarTab(tab);
                      }}
                    >
                      <Icon name={helpSVG} className="" size="19px" />
                    </Button>
                  </>
                )}
              </>
            }
          >
            {editBlock}
          </EditBlockWrapper>
        )}
      </BlocksForm>

      {counterComponent}
      <SidebarPortal selected={selected && !selectedBlock}>
        {instructions && (
          <Segment attached>
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </Segment>
        )}
        {!data?.readOnlySettings && (
          <InlineForm
            schema={EditSchema}
            title="Section (Group) settings"
            formData={data}
            onChangeField={(id, value) => {
              props.onChangeBlock(props.block, {
                ...props.data,
                [id]: value,
              });
            }}
          />
        )}
      </SidebarPortal>
    </fieldset>
  );
};

Edit.propTypes = {
  block: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  manage: PropTypes.bool.isRequired,
};

export default Edit;
