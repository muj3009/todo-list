import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import {
  paletteThemes,
  type PaletteName,
} from '@/constants/colors';
import {
  type Filter,
  type Task,
  TasksProvider,
  useTasks,
} from '@/context/TasksContext';

const serifFont =
  Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }) ?? 'serif';
const metaFont = 'Inter_600SemiBold';

function ProgressPill({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const colors = useColors();
  const progress = total ? completed / total : 0;

  return (
    <View
      accessibilityLabel={`${completed} of ${total} tasks complete`}
      style={[
        styles.progressPill,
        { backgroundColor: colors.secondary, borderColor: colors.rule },
      ]}
    >
      <View style={styles.progressCopy}>
        <Text style={[styles.progressCount, { color: colors.foreground }]}>
          {completed}/{total}
        </Text>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          DONE
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.card }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${progress * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

function PalettePicker() {
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.palettePicker}>
      <Pressable
        accessibilityLabel="Choose colour theme"
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((open) => !open)}
        style={({ pressed }) => [
          styles.paletteButton,
          {
            backgroundColor: colors.secondary,
            borderColor: colors.rule,
            opacity: pressed ? 0.65 : 1,
          },
        ]}
        testID="button-open-palette"
      >
        <View
          style={[styles.paletteButtonDot, { backgroundColor: colors.primary }]}
        />
        <View
          style={[styles.paletteButtonDotAccent, { backgroundColor: colors.accent }]}
        />
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <View
          style={[
            styles.paletteModalBackdrop,
            { backgroundColor: `${colors.foreground}33` },
          ]}
        >
          <Pressable
            accessibilityLabel="Close colour picker"
            onPress={() => setIsOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.paletteMenu,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.paletteMenuHeading}>
              <View>
                <Text
                  style={[
                    styles.paletteMenuTitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  PERSONALISE
                </Text>
                <Text
                  style={[styles.paletteMenuHeadingText, { color: colors.foreground }]}
                >
                  Choose a colour
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close colour picker"
                hitSlop={8}
                onPress={() => setIsOpen(false)}
                style={({ pressed }) => ({ opacity: pressed ? 0.45 : 0.7 })}
              >
                <Text
                  style={[styles.paletteMenuClose, { color: colors.foreground }]}
                >
                  ×
                </Text>
              </Pressable>
            </View>
            <ScrollView
              showsVerticalScrollIndicator
              style={styles.paletteOptionsScroll}
            >
              {Object.entries(paletteThemes).map(([name, theme]) => {
                const isSelected = name === colors.paletteName;
                return (
                  <Pressable
                    accessibilityLabel={`${theme.label} colour theme`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    hitSlop={3}
                    key={name}
                    onPress={() => colors.setPaletteName(name as PaletteName)}
                    style={({ pressed }) => [
                      styles.paletteOption,
                      {
                        backgroundColor: isSelected
                          ? colors.secondary
                          : colors.card,
                        borderColor: isSelected ? colors.rule : colors.card,
                        opacity: pressed ? 0.65 : 1,
                      },
                    ]}
                    testID={`button-palette-${name}`}
                  >
                    <View style={styles.paletteOptionSwatches}>
                      <View
                        style={[
                          styles.paletteOptionSwatch,
                          { backgroundColor: theme.swatches[0] },
                        ]}
                      />
                      <View
                        style={[
                          styles.paletteOptionSwatch,
                          { backgroundColor: theme.swatches[1] },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.paletteOptionLabel,
                        { color: colors.foreground },
                      ]}
                    >
                      {theme.label}
                    </Text>
                    {isSelected ? (
                      <Text
                        style={[
                          styles.paletteSelected,
                          { color: colors.primary },
                        ]}
                      >
                        ✓
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              accessibilityLabel="Finish choosing a colour"
              accessibilityRole="button"
              onPress={() => setIsOpen(false)}
              style={({ pressed }) => [
                styles.paletteDoneButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              testID="button-close-palette"
            >
              <Text
                style={[
                  styles.paletteDoneButtonLabel,
                  { color: colors.primaryForeground },
                ]}
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TaskRow({
  task,
  onDelete,
  onTitleChange,
  onToggle,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onToggle: (id: string) => void;
}) {
  const colors = useColors();
  const isDone = task.completed;
  const taskLabel = task.title.trim() || 'empty task row';
  const checkboxScale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    onToggle(task.id);
    Animated.sequence([
      Animated.timing(checkboxScale, {
        duration: 75,
        toValue: 0.88,
        useNativeDriver: false,
      }),
      Animated.spring(checkboxScale, {
        bounciness: 12,
        speed: 18,
        toValue: 1,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <View style={styles.taskRow} testID={`row-task-${task.id}`}>
      <Pressable
        accessibilityLabel={
          isDone ? `Mark ${taskLabel} active` : `Mark ${taskLabel} complete`
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        hitSlop={8}
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.checkboxPressable,
          { opacity: pressed ? 0.72 : 1 },
        ]}
        testID={`button-toggle-task-${task.id}`}
      >
        <Animated.View
          style={[
            styles.checkbox,
            { transform: [{ scale: checkboxScale }] },
            {
              backgroundColor: isDone
                ? colors.completedCheck
                : colors.secondary,
              borderColor: isDone ? colors.completedCheck : colors.rule,
            },
          ]}
        >
          {isDone ? (
            <Text style={[styles.checkGlyph, { color: colors.card }]}>✓</Text>
          ) : null}
        </Animated.View>
      </Pressable>

      <Pressable
        accessible={false}
        onLongPress={() => onDelete(task.id)}
        style={[
          styles.writeLine,
          {
            backgroundColor: isDone ? colors.completedSurface : colors.muted,
            borderBottomColor: isDone ? colors.completedBorder : colors.rule,
            borderTopColor: isDone ? colors.completedBorder : colors.rule,
          },
        ]}
      >
        <TextInput
          accessibilityHint="Long press the task line to delete it"
          accessibilityLabel={task.title.trim() || 'Task writing line'}
          autoCapitalize="sentences"
          cursorColor={colors.foreground}
          editable={!isDone}
          maxLength={240}
          multiline={false}
          onChangeText={(value) => onTitleChange(task.id, value)}
          scrollEnabled
          selectionColor={colors.foreground}
          style={[
            styles.taskInput,
            {
              color: isDone ? colors.completedText : colors.foreground,
              textDecorationLine: isDone ? 'line-through' : 'none',
            },
          ]}
          testID={`input-task-${task.id}`}
          textAlignVertical="center"
          value={task.title}
        />
      </Pressable>
    </View>
  );
}

function AddRowButton({
  canMove,
  onMove,
  onPress,
}: {
  canMove: boolean;
  onMove: () => void;
  onPress: () => void;
}) {
  const colors = useColors();

  return (
    <View style={styles.addRow}>
      <View style={styles.addRowSpacer} />
      <Pressable
        accessibilityLabel={
          canMove ? 'Move completed tasks to Completed' : 'No completed tasks to move'
        }
        accessibilityRole="button"
        disabled={!canMove}
        onPress={onMove}
        style={({ pressed }) => [
          styles.moveButton,
          {
            backgroundColor: canMove ? colors.primary : colors.secondary,
            borderColor: canMove ? colors.primary : colors.rule,
            opacity: pressed ? 0.65 : canMove ? 1 : 0.55,
          },
        ]}
        testID="button-move-completed"
      >
        <Text
          style={[
            styles.moveButtonLabel,
            { color: canMove ? colors.primaryForeground : colors.mutedForeground },
          ]}
        >
          Move
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Add another task row"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: colors.accent,
            opacity: pressed ? 0.55 : 1,
          },
        ]}
        testID="button-add-task"
      >
        <Text style={[styles.addGlyph, { color: colors.accentForeground }]}>
          +
        </Text>
      </Pressable>
    </View>
  );
}

function TaskEntries({
  compact,
  onDelete,
  onAddRow,
  onMove,
  onTitleChange,
  onToggle,
  canMove,
  showActions,
  tasks,
}: {
  compact: boolean;
  onDelete: (id: string) => void;
  onAddRow: () => void;
  onMove: () => void;
  onTitleChange: (id: string, title: string) => void;
  onToggle: (id: string) => void;
  canMove: boolean;
  showActions: boolean;
  tasks: Task[];
}) {
  const colors = useColors();

  return (
    <View style={[styles.taskRows, compact ? styles.taskRowsCompact : undefined]}>
      {tasks.length ? (
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            onDelete={onDelete}
            onTitleChange={onTitleChange}
            onToggle={onToggle}
            task={task}
          />
        ))
      ) : !showActions ? (
        <View style={styles.emptyTaskState}>
          <Text style={[styles.emptyTaskTitle, { color: colors.foreground }]}>
            No completed tasks yet
          </Text>
          <Text style={[styles.emptyTaskText, { color: colors.mutedForeground }]}>
            Checked tasks you move here will appear in this tab.
          </Text>
        </View>
      ) : null}
      {showActions ? (
        <AddRowButton
          canMove={canMove}
          onMove={onMove}
          onPress={onAddRow}
        />
      ) : null}
    </View>
  );
}

function TaskTabs({
  activeFilter,
  activeCount,
  completedCount,
  onChange,
}: {
  activeFilter: Filter;
  activeCount: number;
  completedCount: number;
  onChange: (filter: Filter) => void;
}) {
  const colors = useColors();
  const tabs: { label: string; value: Filter; count: number }[] = [
    { label: 'Active', value: 'active', count: activeCount },
    { label: 'Completed', value: 'completed', count: completedCount },
  ];

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.taskTabs, { backgroundColor: colors.secondary }]}
    >
      {tabs.map((tab) => {
        const selected = tab.value === activeFilter;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={({ pressed }) => [
              styles.taskTab,
              {
                backgroundColor: selected ? colors.card : colors.secondary,
                borderColor: selected ? colors.rule : colors.secondary,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
            testID={`button-tab-${tab.value}`}
          >
            <Text
              style={[
                styles.taskTabLabel,
                { color: selected ? colors.foreground : colors.mutedForeground },
              ]}
            >
              {tab.label}
            </Text>
            <Text
              style={[
                styles.taskTabCount,
                { color: selected ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab.count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NotesPanel({
  compact,
  note,
  onClose,
  onNoteChange,
}: {
  compact: boolean;
  note: string;
  onClose?: () => void;
  onNoteChange: (value: string) => void;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        compact ? styles.notesColumnCompact : styles.notesColumn,
        compact ? styles.notesColumnStandalone : undefined,
      ]}
    >
      <View style={styles.notesHeadingRow}>
        <Text style={[styles.paperHeading, { color: colors.foreground }]}>
          NOTES
        </Text>
        {onClose ? (
          <Pressable
            accessibilityLabel="Hide notes"
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 0.6 })}
          >
            <Text style={[styles.closeNotesLabel, { color: colors.foreground }]}>
              ×
            </Text>
          </Pressable>
        ) : null}
      </View>
      <TextInput
        accessibilityLabel="Notes"
        multiline
        onChangeText={onNoteChange}
        placeholder="Write anything you want to remember..."
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.notesBox,
          {
            backgroundColor: colors.muted,
            borderColor: colors.rule,
            color: colors.foreground,
          },
        ]}
        testID="input-notes"
        textAlignVertical="top"
        value={note}
      />
    </View>
  );
}

function TaskListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const {
    tasks,
    note,
    filter,
    isLoading,
    loadError,
    addBlankTasks,
    updateTaskTitle,
    toggleTask,
    moveCompletedTasks,
    deleteTask,
    retryLoad,
    setFilter,
    setNote,
  } = useTasks();
  const [notesOpen, setNotesOpen] = useState(false);
  const isNarrow = width < 680;
  const columnGap = Math.max(24, Math.min(72, width * 0.07));
  const defaultRowCount = Math.max(4, Math.floor((height * 0.5) / 58));
  const activeTasks = tasks.filter((task) => !task.movedToCompleted);
  const completedTasks = tasks.filter((task) => task.movedToCompleted);
  const visibleTasks = filter === 'completed' ? completedTasks : activeTasks;
  const activeCompletedCount = activeTasks.filter((task) => task.completed).length;
  const isCompletedTab = filter === 'completed';
  const progressTotal = isCompletedTab ? completedTasks.length : activeTasks.length;
  const progressCompleted = isCompletedTab
    ? completedTasks.length
    : activeCompletedCount;
  const canMove = activeTasks.some((task) => task.completed);

  useEffect(() => {
    if (isLoading || loadError || activeTasks.length >= defaultRowCount) return;
    addBlankTasks(defaultRowCount - activeTasks.length);
  }, [
    activeTasks.length,
    addBlankTasks,
    defaultRowCount,
    isLoading,
    loadError,
  ]);

  if (isLoading) {
    return (
      <View
        style={[styles.centerState, { backgroundColor: colors.background }]}
        testID="status-loading"
      >
        <Text style={[styles.stateHeading, { color: colors.foreground }]}>
          TO DO LIST
        </Text>
        <ActivityIndicator color={colors.checkFill} size="small" />
        <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
          Loading your list
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View
        style={[styles.centerState, { backgroundColor: colors.background }]}
        testID="status-load-error"
      >
        <Text style={[styles.stateHeading, { color: colors.foreground }]}>
          TO DO LIST
        </Text>
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>
          Your list is unavailable
        </Text>
        <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
          {loadError}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={retryLoad}
          style={({ pressed }) => [
            styles.retryButton,
            { borderColor: colors.rule, opacity: pressed ? 0.55 : 1 },
          ]}
          testID="button-retry-load"
        >
          <Text style={[styles.retryLabel, { color: colors.foreground }]}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.secondary, colors.background]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.screen}
    >
      <StatusBar style="dark" />
      <View
        style={[
          styles.marginLine,
          { backgroundColor: colors.paperAccent, pointerEvents: 'none' },
        ]}
      />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 22) + 20,
          paddingHorizontal: 12,
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View
          style={[
            styles.paper,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.paperTopAccent, { backgroundColor: colors.accent }]}>
            <View
              style={[styles.paperAccentDot, { backgroundColor: colors.primary }]}
            />
            <View
              style={[
                styles.paperAccentDot,
                styles.paperAccentDotSmall,
                { backgroundColor: colors.card },
              ]}
            />
          </View>
          <View style={styles.paperContent}>
            {isNarrow ? (
              <>
                <View style={styles.compactHeader}>
                  <View>
                    <Text style={[styles.eyebrow, { color: colors.primary }]}>
                      TODAY'S PLAN
                    </Text>
                    <Text
                      style={[styles.paperHeading, { color: colors.foreground }]}
                    >
                      {isCompletedTab ? 'COMPLETED' : 'TO DO LIST'}
                    </Text>
                  </View>
                  <View style={styles.headerActions}>
                    <ProgressPill
                      completed={progressCompleted}
                      total={progressTotal}
                    />
                    <PalettePicker />
                    <Pressable
                      accessibilityLabel={notesOpen ? 'Hide notes' : 'Show notes'}
                      accessibilityRole="button"
                      onPress={() => setNotesOpen((open) => !open)}
                      style={({ pressed }) => [
                        styles.notesButton,
                        {
                          backgroundColor: colors.secondary,
                          borderColor: colors.rule,
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                      testID="button-toggle-notes"
                    >
                      <Text
                        style={[styles.notesButtonLabel, { color: colors.foreground }]}
                      >
                        {notesOpen ? 'Hide notes' : 'Notes'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <TaskTabs
                  activeFilter={filter}
                  activeCount={activeTasks.length}
                  completedCount={completedTasks.length}
                  onChange={setFilter}
                />
                <View style={styles.todoColumnCompact}>
                  <TaskEntries
                    compact
                    canMove={canMove}
                    onDelete={deleteTask}
                    onAddRow={() => addBlankTasks(1)}
                    onMove={moveCompletedTasks}
                    onTitleChange={updateTaskTitle}
                    onToggle={toggleTask}
                    showActions={!isCompletedTab}
                    tasks={visibleTasks}
                  />
                </View>
                {notesOpen ? (
                  <NotesPanel
                    compact
                    note={note}
                    onClose={() => setNotesOpen(false)}
                    onNoteChange={setNote}
                  />
                ) : null}
              </>
            ) : (
              <View style={[styles.columns, { gap: columnGap }]}>
                <View style={styles.todoColumn}>
                  <View style={styles.wideHeadingRow}>
                    <View>
                      <Text style={[styles.eyebrow, { color: colors.primary }]}>
                        TODAY'S PLAN
                      </Text>
                      <Text
                        style={[styles.paperHeading, { color: colors.foreground }]}
                      >
                        {isCompletedTab ? 'COMPLETED' : 'TO DO LIST'}
                      </Text>
                    </View>
                    <View style={styles.headerActions}>
                      <ProgressPill
                        completed={progressCompleted}
                        total={progressTotal}
                      />
                      <PalettePicker />
                    </View>
                  </View>
                  <TaskTabs
                    activeFilter={filter}
                    activeCount={activeTasks.length}
                    completedCount={completedTasks.length}
                    onChange={setFilter}
                  />
                  <TaskEntries
                    compact={false}
                    canMove={canMove}
                    onDelete={deleteTask}
                    onAddRow={() => addBlankTasks(1)}
                    onMove={moveCompletedTasks}
                    onTitleChange={updateTaskTitle}
                    onToggle={toggleTask}
                    showActions={!isCompletedTab}
                    tasks={visibleTasks}
                  />
                </View>
                <NotesPanel
                  compact={false}
                  note={note}
                  onNoteChange={setNote}
                />
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

export default function Index() {
  return (
    <TasksProvider>
      <TaskListScreen />
    </TasksProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  marginLine: {
    bottom: 0,
    left: 20,
    position: 'absolute',
    top: 0,
    width: 1,
    zIndex: 2,
  },
  paper: {
    alignSelf: 'center',
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 1180,
    overflow: 'hidden',
    width: '100%',
  },
  paperContent: {
    paddingLeft: 28,
    paddingRight: 28,
    paddingTop: 26,
  },
  paperTopAccent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    height: 8,
    paddingHorizontal: 28,
  },
  paperAccentDot: {
    borderRadius: 1,
    height: 8,
    width: 34,
  },
  paperAccentDotSmall: {
    height: 8,
    opacity: 0.7,
    width: 8,
  },
  columns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  columnsCompact: {
    flexDirection: 'column',
  },
  todoColumn: { flex: 1, minWidth: 0 },
  todoColumnCompact: { width: '100%' },
  notesColumn: { flex: 1, minWidth: 0 },
  notesColumnCompact: { width: '100%' },
  notesColumnStandalone: { marginTop: 28 },
  compactHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wideHeadingRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerActions: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  taskTabs: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 18,
    padding: 3,
    width: '100%',
  },
  taskTab: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 8,
  },
  taskTabLabel: {
    fontFamily: metaFont,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  taskTabCount: {
    fontFamily: metaFont,
    fontSize: 10,
  },
  palettePicker: {
    position: 'relative',
  },
  paletteButton: {
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  paletteButtonDot: {
    borderRadius: 2,
    height: 14,
    width: 14,
  },
  paletteButtonDotAccent: {
    borderRadius: 1,
    height: 7,
    marginLeft: -4,
    marginTop: 11,
    width: 7,
  },
  paletteMenu: {
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 320,
    padding: 16,
    width: '100%',
  },
  paletteModalBackdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  paletteMenuHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paletteMenuTitle: {
    fontFamily: metaFont,
    fontSize: 9,
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  paletteMenuHeadingText: {
    fontFamily: serifFont,
    fontSize: 20,
  },
  paletteOptionsScroll: {
    maxHeight: 420,
  },
  paletteMenuClose: {
    fontFamily: serifFont,
    fontSize: 26,
    lineHeight: 28,
  },
  paletteOption: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 6,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  paletteOptionSwatches: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 10,
    width: 29,
  },
  paletteOptionSwatch: {
    borderRadius: 2,
    height: 16,
    width: 16,
  },
  paletteOptionLabel: {
    flex: 1,
    fontFamily: metaFont,
    fontSize: 12,
  },
  paletteSelected: {
    fontFamily: metaFont,
    fontSize: 15,
    lineHeight: 18,
  },
  paletteDoneButton: {
    alignItems: 'center',
    borderRadius: 4,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 46,
  },
  paletteDoneButtonLabel: {
    fontFamily: metaFont,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  eyebrow: {
    fontFamily: metaFont,
    fontSize: 10,
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  progressPill: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minWidth: 72,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  progressCopy: {
    alignItems: 'flex-end',
  },
  progressCount: {
    fontFamily: metaFont,
    fontSize: 12,
    lineHeight: 14,
  },
  progressLabel: {
    fontFamily: metaFont,
    fontSize: 7,
    letterSpacing: 0.9,
    lineHeight: 9,
  },
  progressTrack: {
    borderRadius: 1,
    height: 24,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 4,
  },
  progressFill: {
    borderRadius: 1,
    minHeight: 3,
  },
  notesButton: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  notesButtonLabel: {
    fontFamily: serifFont,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  notesHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeNotesLabel: {
    fontFamily: serifFont,
    fontSize: 22,
    lineHeight: 20,
  },
  paperHeading: {
    fontFamily: serifFont,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 2.2,
    lineHeight: 24,
  },
  taskRows: {
    marginTop: 22,
  },
  taskRowsCompact: {
    marginTop: 18,
  },
  taskRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 58,
    width: '100%',
  },
  checkboxPressable: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginRight: 14,
    width: 32,
  },
  checkbox: {
    borderRadius: 3,
    borderWidth: 2,
    height: 25,
    width: 25,
  },
  checkGlyph: {
    fontFamily: serifFont,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
    textAlign: 'center',
  },
  writeLine: {
    flex: 1,
    borderRadius: 4,
    borderBottomWidth: 1.5,
    borderTopWidth: 1,
    minHeight: 40,
    minWidth: 0,
    paddingHorizontal: 13,
  },
  taskInput: {
    fontFamily: serifFont,
    fontSize: 16,
    height: 38,
    lineHeight: 21,
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    marginLeft: 10,
    width: 36,
  },
  moveButton: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  moveButtonLabel: {
    fontFamily: metaFont,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
    minHeight: 46,
    width: '100%',
  },
  addRowSpacer: {
    flex: 1,
  },
  addGlyph: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 27,
  },
  emptyTaskState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    paddingHorizontal: 24,
  },
  emptyTaskTitle: {
    fontFamily: serifFont,
    fontSize: 17,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  emptyTaskText: {
    fontFamily: serifFont,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 260,
    textAlign: 'center',
  },
  notesBox: {
    borderRadius: 4,
    borderWidth: 1.5,
    fontFamily: serifFont,
    fontSize: 16,
    height: 318,
    lineHeight: 24,
    marginTop: 18,
    padding: 15,
    width: '100%',
  },
  centerState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateHeading: {
    fontFamily: serifFont,
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 22,
  },
  stateText: {
    fontFamily: serifFont,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: serifFont,
    fontSize: 20,
    marginTop: 20,
  },
  retryButton: {
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryLabel: {
    fontFamily: serifFont,
    fontSize: 13,
    letterSpacing: 0.7,
  },
});