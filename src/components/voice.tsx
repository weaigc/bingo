import React, { useEffect } from 'react'
import 'regenerator-runtime/runtime'
import { useSetAtom } from 'jotai'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useBing } from '@/lib/hooks/use-bing'
import Image from 'next/image'
import VoiceIcon from '@/assets/images/voice.svg'
import VoiceButton from './ui/voice'
import { voiceListenAtom } from '@/state'

const Voice = ({ setInput, sendMessage }: Pick<ReturnType<typeof useBing>, 'setInput' | 'sendMessage'>) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  const setListen = useSetAtom(voiceListenAtom)

  useEffect(() => {
    if (/[ 。](发送|清空|退出)。?$/.test(transcript)) {
      const command = RegExp.$1
      if (command === '退出') {
        SpeechRecognition.stopListening()
      } else if (command === '发送') {
        sendMessage(transcript.slice(0, -3))
      }

      resetTranscript()
      return () => {
        SpeechRecognition.stopListening()
      }
    }
    setInput(transcript)
  }, [transcript])

  useEffect(() => {
    setListen(listening)
  }, [listening])

  if (!browserSupportsSpeechRecognition) {
    return null
  }

  return listening ? (
    <VoiceButton onClick={SpeechRecognition.stopListening} />
  ) : (
    <Image alt="start voice" src={VoiceIcon} width={24} className="-mt-0.5" onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'zh-CN' })} />
  )
};
export default Voice;
