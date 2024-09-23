import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { api, Format } from '~/utils/api';
import { useHotkeySettings } from '~/common';
import { type NextPageWithLayout } from './_app';
import { RootLayout } from '~layout';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconCatalog,
  IconStyle,
  Resize,
  Tag,
  TagVariant,
  Textarea,
} from 'side-ui';

type TextVersion = {
  text: string;
  format?: Format;
};

const Home: NextPageWithLayout = () => {
  const [textareaValue, setTextareaValue] = useState('');
  const { shortcuts } = useHotkeySettings();
  const [textVersions, setTextVersions] = useState<Array<TextVersion>>([]);
  const [currentVersion, setCurrentVersion] = useState<TextVersion>();
  const currentVersionIndex = textVersions.findIndex((version) => version.text === currentVersion?.text);

  useEffect(() => {
    setTextareaValue(currentVersion?.text || '');
  }, [currentVersion]);

  const { mutate: dispatchFormat, isLoading } = api.ai.dispatchFormat.useMutation({
    retry: false,
    cacheTime: 0,
    onSuccess(response) {
      if (!response?.data) return;
      if (textVersions.length === 0) {
        setTextVersions((prev) => [
          ...prev,
          {
            text: textareaValue,
          },
          {
            text: response.data.formattedText,
            format: response.data.format,
          },
        ]);
      } else {
        setTextVersions((prev) => [
          ...prev,
          {
            text: response.data.formattedText,
            format: response.data.format,
          },
        ]);
      }

      setCurrentVersion({ text: response.data.formattedText, format: response.data.format });
    },
    onError(error) {
      console.error('dispatchFormat - onError', error);
    },
  });

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(event.target.value);
  };

  const handleHotKey = (formatType: Format) => {
    dispatchFormat({
      text: textareaValue,
      selectedFormat: {
        type: formatType,
      },
    });
  };

  const handlePrevVersionClick = () => {
    if (currentVersionIndex === -1 || currentVersionIndex === 0) return;
    setCurrentVersion(textVersions[currentVersionIndex - 1]);
  };

  const handleNextVersionClick = () => {
    if (currentVersionIndex === -1) return;
    setCurrentVersion(textVersions[currentVersionIndex + 1]);
  };
  useHotkeys(shortcuts.translate, (event) => {
    event.preventDefault();
    void handleHotKey(Format.translate);
  });

  useHotkeys(shortcuts.grammar, (event) => {
    event.preventDefault();
    void handleHotKey(Format.grammar);
  });

  useHotkeys(shortcuts.condense, (event) => {
    event.preventDefault();
    void handleHotKey(Format.condense);
  });

  useHotkeys(shortcuts.formality, (event) => {
    event.preventDefault();
    void handleHotKey(Format.formality);
  });

  useHotkeys(shortcuts.emoji, (event) => {
    event.preventDefault();
    void handleHotKey(Format.emoji);
  });

  useHotkeys(shortcuts.improve, (event) => {
    event.preventDefault();
    void handleHotKey(Format.improve);
  });

  return (
    <main>
      <div className="mx-auto max-w-4xl p-4 px-11">
        {isLoading && <span className="animate-pulse text-primary-200">formateando...</span>}
        <div className="mb-3 flex w-full justify-between border-b border-neutral-900 px-2 pb-4">
          {textVersions.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant={ButtonVariant.ghost}
                size={ButtonSize.xs}
                onClick={handlePrevVersionClick}
                isDisabled={currentVersionIndex === 0}
              >
                <Icon icon={IconCatalog.chevronRight} iconStyle={IconStyle.regular} className="h-4 w-4 rotate-180" />
              </Button>
              <span className="text-white">v{currentVersionIndex + 1}</span>
              <Button
                variant={ButtonVariant.ghost}
                size={ButtonSize.xs}
                onClick={handleNextVersionClick}
                isDisabled={currentVersionIndex === textVersions.length - 1}
              >
                <Icon icon={IconCatalog.chevronRight} iconStyle={IconStyle.regular} className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            <Button className="flex gap-2" variant={ButtonVariant.tertiary} size={ButtonSize.sm}>
              <Icon icon={IconCatalog.clipboard} iconStyle={IconStyle.regular} className="h-4 w-4" />
              <span>Copy</span>
            </Button>
            <Button className="flex gap-2" variant={ButtonVariant.tertiary} size={ButtonSize.sm}>
              <Icon icon={IconCatalog.trash} iconStyle={IconStyle.regular} className="h-4 w-4" />
              <span>Clean</span>
            </Button>
          </div>
        </div>
        <Textarea
          className="border-b border-neutral-900 bg-neutral-950 p-4 text-white"
          textareaClassName="placeholder:text-neutral-600"
          placeholder="Start your journey..."
          styleless
          hasAutoSize
          minHeight="30vh"
          resize={Resize.none}
          value={textareaValue}
          onChange={handleTextChange}
        />
        {textVersions[currentVersionIndex]?.format && (
          <div className="flex items-center gap-2 p-4">
            <span className="text-sm text-neutral-500">Format applied:</span>
            <Tag variant={TagVariant.success}>{textVersions[currentVersionIndex]?.format}</Tag>
          </div>
        )}
      </div>
    </main>
  );
};

Home.getLayout = (page: ReactElement) => <RootLayout>{page}</RootLayout>;
export default Home;
