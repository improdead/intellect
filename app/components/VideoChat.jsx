/**
 * Video Chat component
 * Allows users to input prompts and generate videos
 */
import React, { useState } from 'react';
import { Button, Textarea, Card, Spinner, Box, Text, Flex, Heading, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import VideoGenerationToggle from './VideoGenerationToggle';

const VideoChat = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [script, setScript] = useState(null);
  const [generationOptions, setGenerationOptions] = useState({
    enableVideo: true,
    scriptModel: 'gemini-2.0-flash',
    animationModel: 'gemini-2.5-flash',
    voiceType: 'rachel'
  });

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoData(null);
    setScript(null);

    try {
      // If video generation is disabled, only generate the script
      const endpoint = generationOptions.enableVideo ? '/api/video-generation' : '/api/script-generation';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userId: 'anonymous', // Replace with actual user ID if available
          options: generationOptions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setVideoData(data);
      setScript(data.script);

      // Show success message based on what was generated
      console.log(`Successfully generated ${generationOptions.enableVideo ? 'video' : 'script'}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={4}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Manim.js Video Generator
      </Heading>

      <Tabs variant="enclosed" mb={6}>
        <TabList>
          <Tab>Generate</Tab>
          <Tab>Options</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pt={4}>
            <Card p={4} variant="outline">
              <form onSubmit={handleSubmit}>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt for your educational video (e.g., 'Explain the Pythagorean theorem')"
                  size="lg"
                  mb={4}
                  rows={4}
                  isDisabled={loading}
                />

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText={generationOptions.enableVideo ? "Generating video..." : "Generating script..."}
                  width="full"
                >
                  {generationOptions.enableVideo ? "Generate Video" : "Generate Script"}
                </Button>
              </form>
            </Card>
          </TabPanel>

          <TabPanel p={0} pt={4}>
            <VideoGenerationToggle
              options={generationOptions}
              setOptions={setGenerationOptions}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {error && (
        <Card p={4} mb={6} bg="red.50" borderColor="red.300" variant="outline">
          <Text color="red.500">{error}</Text>
        </Card>
      )}

      {loading && (
        <Flex direction="column" align="center" justify="center" p={8}>
          <Spinner size="xl" mb={4} />
          <Text>Generating your video. This may take a few minutes...</Text>
        </Flex>
      )}

      {videoData && (
        <Card p={4} mb={6} variant="outline">
          <Heading as="h2" size="md" mb={4}>
            {generationOptions.enableVideo ? 'Your Video' : 'Generated Script'}
          </Heading>

          {generationOptions.enableVideo && (
            <>
              <Box mb={4}>
                <video
                  controls
                  width="100%"
                  src={videoData.url}
                  poster="/video-placeholder.jpg"
                />
              </Box>

              <Button
                as="a"
                href={videoData.url}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="green"
                mb={4}
              >
                Download Video
              </Button>
            </>
          )}

          {script && (
            <Box mt={4}>
              <Heading as="h3" size="sm" mb={2}>
                Generated Script
              </Heading>
              <Box
                p={3}
                bg="gray.50"
                borderRadius="md"
                fontSize="sm"
                whiteSpace="pre-wrap"
              >
                {script}
              </Box>
            </Box>
          )}

          {videoData.options && (
            <Box mt={4} p={3} bg="blue.50" borderRadius="md">
              <Heading as="h3" size="sm" mb={2}>
                Generation Details
              </Heading>
              <Text fontSize="sm">Script Model: {videoData.options.scriptModel}</Text>
              {videoData.options.animationModel && (
                <Text fontSize="sm">Animation Model: {videoData.options.animationModel}</Text>
              )}
              {videoData.options.voiceType && (
                <Text fontSize="sm">Voice Type: {videoData.options.voiceType}</Text>
              )}
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};

export default VideoChat;
