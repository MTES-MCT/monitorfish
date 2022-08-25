import React from 'react'
import { Input, InputGroup, Grid, Row, Col } from 'rsuite'
import SearchIcon from '@rsuite/icons/Search';

export default {
  title: 'RsuiteMonitor/Input'
};

const styles = {
  marginBottom: 10
};

const CustomInput = ({ ...props }) => <Input {...props} style={styles} />;

const CustomInputGroup = ({ placeholder, ...props }) => (
  <InputGroup {...props} style={styles}>
    <Input placeholder={placeholder} />
    <InputGroup.Addon>
      <SearchIcon />
    </InputGroup.Addon>
  </InputGroup>
);

const CustomInputGroupWidthButton = ({ placeholder, ...props }) => (
  <InputGroup {...props} inside style={styles}>
    <Input placeholder={placeholder} />
    <InputGroup.Button>
      <SearchIcon />
    </InputGroup.Button>
  </InputGroup>
);


const TemplateInput = ({classPrefix, style})=> {
  return (
    <Grid fluid style={style}>
      <Row>
        <Col xs={24} sm={12} md={8}>
          <CustomInput size="lg" placeholder="Large" classPrefix={classPrefix} />
          <CustomInput size="md" placeholder="Medium" classPrefix={classPrefix}  />
          <CustomInput size="sm" placeholder="Small" classPrefix={classPrefix}  />
          <CustomInput size="xs" placeholder="Xsmall" classPrefix={classPrefix}  />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <CustomInputGroup size="lg" placeholder="Large" classPrefix={classPrefix}  />
          <CustomInputGroup size="md" placeholder="Medium" classPrefix={classPrefix}  />
          <CustomInputGroup size="sm" placeholder="Small" classPrefix={classPrefix}  />
          <CustomInputGroup size="xs" placeholder="Xsmall" classPrefix={classPrefix}  />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <CustomInputGroupWidthButton size="lg" placeholder="Large" classPrefix={classPrefix}  />
          <CustomInputGroupWidthButton size="md" placeholder="Medium" classPrefix={classPrefix}  />
          <CustomInputGroupWidthButton size="sm" placeholder="Small" classPrefix={classPrefix}  />
          <CustomInputGroupWidthButton size="xs" placeholder="Xsmall" classPrefix={classPrefix}  />
        </Col>
      </Row>
    </Grid>
  )
}



export const InputSizes = TemplateInput.bind({})

const TemplateTextArea = ({rows}) => (
  <>
    <Input as="textarea" rows={rows} placeholder="Textarea" />
  </>
);

export const TextArea = TemplateTextArea.bind({})
TextArea.args = {
  rows: 3
}