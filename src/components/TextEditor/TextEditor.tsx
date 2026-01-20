import React, { useState } from 'react';
import { Modal, Form, Input, Select, ColorPicker, Button, InputNumber } from 'antd';
import { FontSizeOutlined } from '@ant-design/icons';
import './TextEditor.css';

const { Option } = Select;
const { TextArea } = Input;

interface TextEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (textData: any) => void;
  initialData?: any;
}

const TextEditor: React.FC<TextEditorProps> = ({ visible, onClose, onSave, initialData }) => {
  const [form] = Form.useForm();

  const handleSave = async () => {
    const values = await form.validateFields();
    onSave(values);
    onClose();
  };

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
  ];

  const animationTypes = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade In' },
    { value: 'slide-left', label: 'Slide from Left' },
    { value: 'slide-right', label: 'Slide from Right' },
    { value: 'slide-up', label: 'Slide from Bottom' },
    { value: 'slide-down', label: 'Slide from Top' },
    { value: 'typewriter', label: 'Typewriter' },
    { value: 'scale', label: 'Scale In' },
  ];

  return (
    <Modal
      title={<><FontSizeOutlined /> Text Editor</>}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          initialData || {
            text: '',
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#ffffff',
            backgroundColor: 'transparent',
            bold: false,
            italic: false,
            underline: false,
            align: 'center',
            position: { x: 50, y: 50 },
            animation: 'none',
            duration: 3,
            strokeWidth: 0,
            strokeColor: '#000000',
            shadow: false,
          }
        }
      >
        <Form.Item label="Text" name="text" rules={[{ required: true }]}>
          <TextArea rows={4} placeholder="Enter your text here..." />
        </Form.Item>

        <Form.Item label="Font Family" name="fontFamily">
          <Select>
            {fontFamilies.map((font) => (
              <Option key={font} value={font}>
                {font}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Font Size" name="fontSize">
          <InputNumber min={12} max={200} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Text Color" name="color">
          <Input type="color" />
        </Form.Item>

        <Form.Item label="Background Color" name="backgroundColor">
          <Input type="color" />
        </Form.Item>

        <Form.Item label="Alignment" name="align">
          <Select>
            <Option value="left">Left</Option>
            <Option value="center">Center</Option>
            <Option value="right">Right</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Animation" name="animation">
          <Select>
            {animationTypes.map((anim) => (
              <Option key={anim.value} value={anim.value}>
                {anim.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Duration (seconds)" name="duration">
          <InputNumber min={0.5} max={60} step={0.5} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Stroke Width" name="strokeWidth">
          <InputNumber min={0} max={20} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Stroke Color" name="strokeColor">
          <Input type="color" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TextEditor;
