import { Action, ActionPanel, clearSearchBar, Color, Icon, List, useNavigation } from "@raycast/api";
import React, { useEffect } from "react";
import { exportClipboard, exportPaste } from "./clipboard";
import { useGitignore } from "./hooks";
import GitignorePreview from "./preview";
import { GitignoreFile } from "./types";

function GitignoreList({
  gitignoreFiles,
  selected,
  toggleSelection,
}: {
  gitignoreFiles: GitignoreFile[];
  selected: boolean;
  toggleSelection: (gitignoreFile: GitignoreFile) => void;
}) {
  const { push } = useNavigation();

  return (
    <React.Fragment>
      {gitignoreFiles.map((gitignore) => {
        const keywords = gitignore.folder !== undefined ? [gitignore.folder] : undefined;
        return (
          <List.Item
            key={gitignore.path}
            id={gitignore.path}
            icon={selected ? { source: Icon.Checkmark, tintColor: Color.Green } : Icon.Circle}
            title={gitignore.name}
            keywords={keywords}
            accessoryTitle={gitignore.folder}
            actions={
              <ActionPanel>
                <Action
                  title={selected ? "Deselect" : "Select"}
                  icon={selected ? Icon.Circle : Icon.Checkmark}
                  onAction={() => {
                    toggleSelection(gitignore);
                  }}
                />
                {CopyToClipboardAction([gitignore])}
                {PasteAction([gitignore])}
                {PreviewAction(push, [gitignore])}
              </ActionPanel>
            }
          />
        );
      })}
    </React.Fragment>
  );
}

export default function Gitignore() {
  const { push } = useNavigation();

  const [{ gitignoreFiles, lastUpdated, loading }, selectedIds, toggleSelection, refresh] = useGitignore();

  useEffect(() => {
    clearSearchBar({ forceScrollToTop: false });
  }, [selectedIds]);

  const selected = gitignoreFiles.filter((gitignoreFile) => selectedIds.has(gitignoreFile.id));
  const unselected = gitignoreFiles.filter((gitignoreFile) => !selectedIds.has(gitignoreFile.id));

  return (
    <List isLoading={loading}>
      <List.Section>
        {selected.length > 0 ? (
          <List.Item
            icon={Icon.Document}
            title="Create .gitignore From Selection"
            actions={
              <ActionPanel>
                {CopyToClipboardAction(selected)}
                {PasteAction(selected)}
                {PreviewAction(push, selected)}
              </ActionPanel>
            }
          />
        ) : (
          !loading && (
            <List.Item
              icon={Icon.Download}
              title="Refresh"
              subtitle={lastUpdated != null ? `Last updated ${lastUpdated.toLocaleString()}` : undefined}
              actions={
                <ActionPanel>
                  <Action title="Refresh" onAction={refresh} />
                </ActionPanel>
              }
            />
          )
        )}
      </List.Section>
      {/* Render selected files */}
      {selected && (
        <List.Section title="Selected">
          <GitignoreList gitignoreFiles={selected} selected={true} toggleSelection={toggleSelection} />
        </List.Section>
      )}
      {/* Render unselected files */}
      {unselected && (
        <List.Section title="Available">
          <GitignoreList gitignoreFiles={unselected} selected={false} toggleSelection={toggleSelection} />
        </List.Section>
      )}
    </List>
  );
}

function PreviewAction(push: (component: React.ReactNode) => void, selected: GitignoreFile[]) {
  return (
    <Action
      title="Preview"
      icon={Icon.Eye}
      shortcut={{ modifiers: ["cmd"], key: "p" }}
      onAction={() => push(<GitignorePreview gitignoreFiles={selected} />)}
    />
  );
}

function PasteAction(selected: GitignoreFile[]) {
  return <Action title="Paste to App" icon={Icon.TextDocument} onAction={() => exportPaste(selected)} />;
}

function CopyToClipboardAction(selected: GitignoreFile[]) {
  return <Action title="Copy to Clipboard" icon={Icon.Clipboard} onAction={() => exportClipboard(selected)} />;
}
