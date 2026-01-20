import React, { useState, useEffect } from 'react';
import { Collapse, Slider, Button, Space } from 'antd';
import {
  BgColorsOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateClip } from '../../store/timelineSlice';
import './EffectsPanel.css';

const { Panel } = Collapse;

const EffectsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.timeline.selectedClipIds);
  const clips = useAppSelector((state) => state.timeline.clips);
  
  const selectedClip = clips.find((c) => c.id === selectedClipIds[0]);
  
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  // Load effects from selected clip
  useEffect(() => {
    if (selectedClip && selectedClip.effects) {
      selectedClip.effects.forEach((effect: any) => {
        const value = effect.parameters?.value || 0;
        switch (effect.type) {
          case 'brightness':
            setBrightness(value);
            break;
          case 'contrast':
            setContrast(value);
            break;
          case 'saturation':
            setSaturation(value);
            break;
          case 'blur':
            setBlur(value);
            break;
          case 'hue':
            setHue(value);
            break;
          case 'grayscale':
            setGrayscale(value);
            break;
          case 'sepia':
            setSepia(value);
            break;
        }
      });
    } else {
      // Reset to defaults
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setBlur(0);
      setHue(0);
      setGrayscale(0);
      setSepia(0);
    }
  }, [selectedClip]);

  const handleEffectChange = (effectType: string, value: number) => {
    if (!selectedClip) return;

    const effects = selectedClip.effects || [];
    const existingEffectIndex = effects.findIndex((e: any) => e.type === effectType);

    let updatedEffects;
    if (existingEffectIndex >= 0) {
      // Update existing effect
      updatedEffects = [...effects];
      updatedEffects[existingEffectIndex] = {
        ...updatedEffects[existingEffectIndex],
        parameters: { value }
      };
    } else {
      // Add new effect
      const newEffect = {
        id: `${effectType}-${Date.now()}`,
        type: effectType,
        name: effectType.charAt(0).toUpperCase() + effectType.slice(1),
        enabled: true,
        parameters: { value },
      };
      updatedEffects = [...effects, newEffect];
    }

    dispatch(updateClip({
      id: selectedClip.id,
      updates: { effects: updatedEffects },
    }));
  };

  const resetEffects = () => {
    if (!selectedClip) return;
    
    dispatch(updateClip({
      id: selectedClip.id,
      updates: { effects: [] },
    }));
  };

  const addPreset = (preset: string) => {
    if (!selectedClip) return;
    
    const presets: Record<string, Array<{type: string, value: number}>> = {
      vintage: [
        { type: 'sepia', value: 40 },
        { type: 'contrast', value: -10 },
        { type: 'saturation', value: -20 }
      ],
      cold: [
        { type: 'hue', value: 180 },
        { type: 'saturation', value: 20 }
      ],
      warm: [
        { type: 'hue', value: -20 },
        { type: 'saturation', value: 20 }
      ],
      dramatic: [
        { type: 'contrast', value: 40 },
        { type: 'saturation', value: 30 }
      ],
      bw: [
        { type: 'grayscale', value: 100 },
        { type: 'contrast', value: 20 }
      ]
    };

    const effects = presets[preset].map((e, i) => ({
      id: `${e.type}-${Date.now()}-${i}`,
      type: e.type,
      name: e.type.charAt(0).toUpperCase() + e.type.slice(1),
      enabled: true,
      parameters: { value: e.value }
    }));

    dispatch(updateClip({
      id: selectedClip.id,
      updates: { effects },
    }));
  };

  return (
    <div className="effects-panel">
      <div className="effects-header">
        <h3>Effects</h3>
        {selectedClip && (
          <Button size="small" onClick={resetEffects}>
            Reset All
          </Button>
        )}
      </div>

      {!selectedClip ? (
        <div className="effects-empty">
          <p>Select a clip to apply effects</p>
        </div>
      ) : (
        <>
          <div className="effects-presets">
            <h4>Presets</h4>
            <Space wrap>
              <Button size="small" onClick={() => addPreset('vintage')}>
                Vintage
              </Button>
              <Button size="small" onClick={() => addPreset('cold')}>
                Cold
              </Button>
              <Button size="small" onClick={() => addPreset('warm')}>
                Warm
              </Button>
              <Button size="small" onClick={() => addPreset('dramatic')}>
                Dramatic
              </Button>
              <Button size="small" onClick={() => addPreset('bw')}>
                B&W
              </Button>
            </Space>
          </div>

          <Collapse defaultActiveKey={['color']} ghost>
            <Panel header={<><BgColorsOutlined /> Color Correction</>} key="color">
              <div className="effect-control">
                <label>Brightness</label>
                <Slider
                  min={-100}
                  max={100}
                  value={brightness}
                  onChange={(value) => {
                    setBrightness(value);
                    handleEffectChange('brightness', value);
                  }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
              </div>

              <div className="effect-control">
                <label>Contrast</label>
                <Slider
                  min={-100}
                  max={100}
                  value={contrast}
                  onChange={(value) => {
                    setContrast(value);
                    handleEffectChange('contrast', value);
                  }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
              </div>

              <div className="effect-control">
                <label>Saturation</label>
                <Slider
                  min={-100}
                  max={100}
                  value={saturation}
                  onChange={(value) => {
                    setSaturation(value);
                    handleEffectChange('saturation', value);
                  }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
              </div>

              <div className="effect-control">
                <label>Hue</label>
                <Slider
                  min={-180}
                  max={180}
                  value={hue}
                  onChange={(value) => {
                    setHue(value);
                    handleEffectChange('hue', value);
                  }}
                  tooltip={{ formatter: (value) => `${value}°` }}
                />
              </div>
            </Panel>

            <Panel header={<><ThunderboltOutlined /> Stylize</>} key="stylize">
              <div className="effect-control">
                <label>Blur</label>
                <Slider
                  min={0}
                  max={20}
                  value={blur}
                  onChange={(value) => {
                    setBlur(value);
                    handleEffectChange('blur', value);
                  }}
                  tooltip={{ formatter: (value) => `${value}px` }}
                />
              </div>

              <div className="effect-control">
                <label>Grayscale</label>
                <Slider
                  min={0}
                  max={100}
                  value={grayscale}
                  onChange={(value) => {
                    setGrayscale(value);
                    handleEffectChange('grayscale', value);
                  }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
              </div>

              <div className="effect-control">
                <label>Sepia</label>
                <Slider
                  min={0}
                  max={100}
                  value={sepia}
                  onChange={(value) => {
                    setSepia(value);
                    handleEffectChange('sepia', value);
                  }}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
              </div>
            </Panel>
          </Collapse>
        </>
      )}
    </div>
  );
};

export default EffectsPanel;
