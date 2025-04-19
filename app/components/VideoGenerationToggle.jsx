'use client';

import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Switch,
  Stack,
  Radio,
  RadioGroup,
  Tooltip,
  Text
} from '@chakra-ui/react';

/**
 * Video generation options toggle component
 * Allows users to toggle video generation options
 */
const VideoGenerationToggle = ({ options, setOptions }) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
      <Text fontWeight="bold" mb={3}>Video Generation Options</Text>
      
      <Stack spacing={4}>
        {/* Enable/Disable Video Generation */}
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="enable-video" mb="0">
            Enable Video Generation
          </FormLabel>
          <Tooltip label="Toggle to enable or disable video generation">
            <Switch
              id="enable-video"
              isChecked={options.enableVideo}
              onChange={(e) => setOptions({
                ...options,
                enableVideo: e.target.checked
              })}
            />
          </Tooltip>
        </FormControl>
        
        {/* AI Model Selection */}
        <FormControl isDisabled={!options.enableVideo}>
          <FormLabel>AI Model for Script Generation</FormLabel>
          <RadioGroup
            value={options.scriptModel}
            onChange={(value) => setOptions({
              ...options,
              scriptModel: value
            })}
          >
            <Stack direction="row">
              <Radio value="gemini-2.0-flash">Gemini 2.0 Flash</Radio>
              <Radio value="gemini-2.5-flash">Gemini 2.5 Flash (Pro)</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        
        {/* Animation Model Selection */}
        <FormControl isDisabled={!options.enableVideo}>
          <FormLabel>AI Model for Animation Generation</FormLabel>
          <RadioGroup
            value={options.animationModel}
            onChange={(value) => setOptions({
              ...options,
              animationModel: value
            })}
          >
            <Stack direction="row">
              <Radio value="gemini-2.0-flash">Gemini 2.0 Flash</Radio>
              <Radio value="gemini-2.5-flash">Gemini 2.5 Flash (Pro)</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        
        {/* Voice Options */}
        <FormControl isDisabled={!options.enableVideo}>
          <FormLabel>Voice Options</FormLabel>
          <RadioGroup
            value={options.voiceType}
            onChange={(value) => setOptions({
              ...options,
              voiceType: value
            })}
          >
            <Stack direction="row">
              <Radio value="rachel">Rachel (Female)</Radio>
              <Radio value="adam">Adam (Male)</Radio>
              <Radio value="antoni">Antoni (British)</Radio>
              <Radio value="none">No Voice</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default VideoGenerationToggle;
