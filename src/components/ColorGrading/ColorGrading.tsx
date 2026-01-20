import React from 'react';
import { Collapse, Slider, ColorPicker, InputNumber, Row, Col } from 'antd';
import './ColorGrading.css';

const { Panel } = Collapse;

interface ColorGradingProps {
  onParameterChange: (param: string, value: any) => void;
  parameters: any;
}

const ColorGrading: React.FC<ColorGradingProps> = ({ onParameterChange, parameters = {} }) => {
  return (
    <div className="color-grading">
      <Collapse defaultActiveKey={['basic']}>
        <Panel header="Basic Correction" key="basic">
          <div className="control-group">
            <label>Exposure</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.exposure || 0}
              onChange={(v) => onParameterChange('exposure', v)}
            />
          </div>

          <div className="control-group">
            <label>Contrast</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.contrast || 0}
              onChange={(v) => onParameterChange('contrast', v)}
            />
          </div>

          <div className="control-group">
            <label>Highlights</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.highlights || 0}
              onChange={(v) => onParameterChange('highlights', v)}
            />
          </div>

          <div className="control-group">
            <label>Shadows</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.shadows || 0}
              onChange={(v) => onParameterChange('shadows', v)}
            />
          </div>

          <div className="control-group">
            <label>Whites</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.whites || 0}
              onChange={(v) => onParameterChange('whites', v)}
            />
          </div>

          <div className="control-group">
            <label>Blacks</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.blacks || 0}
              onChange={(v) => onParameterChange('blacks', v)}
            />
          </div>
        </Panel>

        <Panel header="Color Wheels" key="wheels">
          <div className="color-wheels">
            <div className="wheel-group">
              <label>Lift (Shadows)</label>
              <ColorPicker
                value={parameters.lift || '#808080'}
                onChange={(color) => onParameterChange('lift', color.toHexString())}
              />
            </div>

            <div className="wheel-group">
              <label>Gamma (Midtones)</label>
              <ColorPicker
                value={parameters.gamma || '#808080'}
                onChange={(color) => onParameterChange('gamma', color.toHexString())}
              />
            </div>

            <div className="wheel-group">
              <label>Gain (Highlights)</label>
              <ColorPicker
                value={parameters.gain || '#808080'}
                onChange={(color) => onParameterChange('gain', color.toHexString())}
              />
            </div>
          </div>
        </Panel>

        <Panel header="HSL" key="hsl">
          <div className="control-group">
            <label>Hue</label>
            <Slider
              min={-180}
              max={180}
              value={parameters.hue || 0}
              onChange={(v) => onParameterChange('hue', v)}
            />
          </div>

          <div className="control-group">
            <label>Saturation</label>
            <Slider
              min={0}
              max={200}
              value={parameters.saturation || 100}
              onChange={(v) => onParameterChange('saturation', v)}
            />
          </div>

          <div className="control-group">
            <label>Luminance</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.luminance || 0}
              onChange={(v) => onParameterChange('luminance', v)}
            />
          </div>
        </Panel>

        <Panel header="Vignette" key="vignette">
          <div className="control-group">
            <label>Amount</label>
            <Slider
              min={0}
              max={100}
              value={parameters.vignetteAmount || 0}
              onChange={(v) => onParameterChange('vignetteAmount', v)}
            />
          </div>

          <div className="control-group">
            <label>Midpoint</label>
            <Slider
              min={0}
              max={100}
              value={parameters.vignetteMidpoint || 50}
              onChange={(v) => onParameterChange('vignetteMidpoint', v)}
            />
          </div>

          <div className="control-group">
            <label>Roundness</label>
            <Slider
              min={0}
              max={100}
              value={parameters.vignetteRoundness || 50}
              onChange={(v) => onParameterChange('vignetteRoundness', v)}
            />
          </div>
        </Panel>

        <Panel header="Temperature & Tint" key="temperature">
          <div className="control-group">
            <label>Temperature</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.temperature || 0}
              onChange={(v) => onParameterChange('temperature', v)}
            />
          </div>

          <div className="control-group">
            <label>Tint</label>
            <Slider
              min={-100}
              max={100}
              value={parameters.tint || 0}
              onChange={(v) => onParameterChange('tint', v)}
            />
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ColorGrading;
