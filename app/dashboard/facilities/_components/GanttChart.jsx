// app/dashboard/facilities/_components/GanttChart.jsx
'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:           '#0f1117',
  surface:      '#171b26',
  surface2:     '#1e2333',
  border:       '#252b3b',
  borderWeek:   '#3a4468',
  text:         '#c8d0e8',
  textDim:      '#4a5470',
  textBright:   '#eef1f9',
  blue:         '#3d7fff',
  blueOverlap:  '#1a5acc',
  gray:         '#5a6480',
  weekendBg:    '#0d1018',
  todayBg:      'rgba(61,127,255,0.11)',
  todayBorder:  '#3d7fff',
  labelBg:      '#171b26',
  groupBg:      '#1a1f2e',
}

const STATUS_COLORS = {
  'In progress':  '#3d7fff',
  'Complete':     '#2ec27e',
  'Not started':  '#556080',
  'On hold':      '#c98a00',
  'Cancelled':    '#b03030',
}
const fallbackColor = '#7b4fa6'

const LABEL_W   = 220   // px — sticky label column width
const WEEKDAY_W = 22    // px per weekday column
const WEEKEND_W = 10    // px per weekend column
const ROW_H     = 30    // px per row
const BAR_H     = 18    // px bar height
const BAR_TOP   = (ROW_H - BAR_H) / 2  // vertically centred

// ─── Date helpers ─────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseDate(str) {
  if (!str || typeof str !== 'string') return null
  // Format: DD-Mon-YYYY  e.g.  28-Jul-2025
  const parts = str.split('-')
  if (parts.length !== 3) return null
  const d = parseInt(parts[0], 10)
  const m = MONTH_NAMES.indexOf(parts[1])
  const y = parseInt(parts[2], 10)
  if (isNaN(d) || m === -1 || isNaN(y)) return null
  return new Date(y, m, d)
}

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function isWeekendDay(d) {
  const day = d.getDay()
  return day === 0 || day === 6
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

// Monday on or before the given date
function snapToMonday(d) {
  const day = d.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  return addDays(d, diff)
}

// Count working days between two dates inclusive
function countWorkingDays(start, finish) {
  let count = 0
  const d = new Date(start)
  d.setHours(0, 0, 0, 0)
  const end = new Date(finish)
  end.setHours(0, 0, 0, 0)
  while (d <= end) {
    if (!isWeekendDay(d)) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

// Walk forward from start, consuming N working days; return the boundary date
function addWorkingDays(start, n) {
  if (n <= 0) return new Date(start)
  const d = new Date(start)
  d.setHours(0, 0, 0, 0)
  let remaining = n
  while (remaining > 0) {
    d.setDate(d.getDate() + 1)
    if (!isWeekendDay(d)) remaining--
  }
  return d
}

// ISO week number
function isoWeek(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  )
}

// ─── Timeline computation ─────────────────────────────────────────────────────
function buildTimeline(pageOffset) {
  // Anchor = Monday on or before (today − 14 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const anchor = snapToMonday(addDays(today, -14))

  // View start shifts by pageOffset × 26 weeks
  const viewStart = addDays(anchor, pageOffset * 26 * 7)

  const TOTAL_DAYS = 28 * 7  // 196

  const days = []
  let cumLeft = 0
  const keyMap = {}  // dateKey → index

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = addDays(viewStart, i)
    const weekend = isWeekendDay(date)
    const width = weekend ? WEEKEND_W : WEEKDAY_W
    const key = dateKey(date)
    days.push({ date, weekend, width, left: cumLeft, index: i })
    keyMap[key] = i
    cumLeft += width
  }

  const totalWidth = cumLeft

  return { viewStart, days, keyMap, totalWidth, today, anchor }
}

// ─── Header group builders ────────────────────────────────────────────────────
function buildMonthGroups(days) {
  const groups = []
  let cur = null
  days.forEach(col => {
    const label = `${MONTH_NAMES[col.date.getMonth()]} ${col.date.getFullYear()}`
    if (!cur || cur.label !== label) {
      cur = { label, left: col.left, width: 0 }
      groups.push(cur)
    }
    cur.width += col.width
  })
  return groups
}

function buildWeekGroups(days) {
  const groups = []
  let cur = null
  days.forEach(col => {
    const wk = isoWeek(col.date)
    const yr = col.date.getFullYear()
    const id = `${yr}-W${wk}`
    if (!cur || cur.id !== id) {
      cur = { id, label: `W${wk}`, left: col.left, width: 0, weekNum: wk }
      groups.push(cur)
    }
    cur.width += col.width
  })
  return groups
}

// ─── Bar positioning helpers ──────────────────────────────────────────────────
function getBarPixels(startDate, finishDate, days, keyMap, totalWidth) {
  if (!startDate || !finishDate) return null

  const sd = new Date(startDate); sd.setHours(0, 0, 0, 0)
  const fd = new Date(finishDate); fd.setHours(0, 0, 0, 0)

  const firstDay = days[0]
  const lastDay  = days[days.length - 1]

  // Fully outside window
  if (fd < firstDay.date || sd > lastDay.date) return null

  const beforeWindow = sd < firstDay.date
  const afterWindow  = fd > lastDay.date

  let left, right

  if (beforeWindow) {
    left = 0
  } else {
    const key = dateKey(sd)
    const idx = keyMap[key]
    left = idx != null ? days[idx].left : 0
  }

  if (afterWindow) {
    right = totalWidth
  } else {
    const key = dateKey(fd)
    const idx = keyMap[key]
    right = idx != null ? days[idx].left + days[idx].width : totalWidth
  }

  return {
    left,
    width: Math.max(right - left, 4),
    beforeWindow,
    afterWindow,
  }
}

function getProgressSplitPx(tbStart, tbFinish, percentComplete, days, keyMap, totalWidth) {
  const pct = parseInt(percentComplete, 10) || 0
  if (pct <= 0) return null

  const start  = parseDate(tbStart)
  const finish = parseDate(tbFinish)
  if (!start || !finish) return null

  const totalWork  = countWorkingDays(start, finish)
  const elapsed    = Math.floor(totalWork * pct / 100)
  const boundary   = addWorkingDays(start, elapsed)

  const boundaryKey = dateKey(boundary)
  const idx = keyMap[boundaryKey]
  if (idx == null) {
    // boundary outside window — return width of whole bar as gray or 0
    if (boundary < days[0].date) return 0
    return totalWidth
  }
  return days[idx].left + days[idx].width
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const Tooltip = ({ task, x, y }) => (
  <div
    style={{
      position: 'fixed',
      left: x + 14,
      top: y - 10,
      zIndex: 9999,
      background: T.surface2,
      border: `1px solid ${T.borderWeek}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: T.text,
      fontSize: 12,
      pointerEvents: 'none',
      minWidth: 200,
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      lineHeight: 1.6,
    }}
  >
    <div style={{ color: T.textBright, fontWeight: 600, marginBottom: 4 }}>{task.tbName}</div>
    <table style={{ borderSpacing: '8px 0' }}>
      <tbody>
        <Row label="Start"    val={task.tbStart} />
        <Row label="Finish"   val={task.tbFinish} />
        <Row label="Status"   val={task.tbMDStatus} />
        <Row label="Owner"    val={task.tbOwner} />
        <Row label="Priority" val={task.tbMDPriority} />
        <Row label="% Done"   val={task.tbPercentComplete != null ? `${task.tbPercentComplete}%` : null} />
      </tbody>
    </table>
  </div>
)

const Row = ({ label, val }) => {
  if (!val) return null
  return (
    <tr>
      <td style={{ color: T.textDim, whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ color: T.text }}>{val}</td>
    </tr>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const Legend = ({ tasks }) => {
  const statuses = useMemo(() => {
    const seen = new Set()
    tasks.forEach(t => { if (t.tbMDStatus) seen.add(t.tbMDStatus) })
    return Array.from(seen).sort()
  }, [tasks])

  const hasMilestone = tasks.some(t => t.tbType === 'Milestone')

  if (statuses.length === 0 && !hasMilestone) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', marginBottom: 12, alignItems: 'center' }}>
      {statuses.map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: STATUS_COLORS[s] || fallbackColor,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: T.text }}>{s}</span>
        </div>
      ))}
      {hasMilestone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M6 0 L12 6 L6 12 L0 6 Z" fill={T.textBright} />
          </svg>
          <span style={{ fontSize: 12, color: T.text }}>Milestone</span>
        </div>
      )}
    </div>
  )
}

// ─── Single bar renderer ──────────────────────────────────────────────────────
const TaskBar = ({ task, days, keyMap, totalWidth, onMouseEnter, onMouseLeave }) => {
  const isMilestone = task.tbType === 'Milestone'

  if (isMilestone) {
    const date = parseDate(task.tbStart) || parseDate(task.tbFinish)
    if (!date) return null
    const key = dateKey(date)
    const idx = keyMap[key]
    if (idx == null) return null
    const col = days[idx]
    const cx = col.left + col.width / 2
    const cy = ROW_H / 2
    const size = BAR_H * 0.55

    return (
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: totalWidth, height: ROW_H, overflow: 'visible', pointerEvents: 'none' }}
      >
        <polygon
          points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
          fill={T.textBright}
          stroke={T.bg}
          strokeWidth={1}
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </svg>
    )
  }

  // ── Regular task bar ──
  const hasActualFinish = task.tbAFinish && task.tbAFinish.trim() !== ''
  const hasActualStart  = task.tbAStart  && task.tbAStart.trim()  !== ''

  // Determine bar span dates
  let barStart, barEnd, grayEnd
  let isSplit = false

  if (hasActualFinish) {
    // Fully complete — gray bar from actual start to actual finish
    barStart = parseDate(task.tbAStart) || parseDate(task.tbStart)
    barEnd   = parseDate(task.tbAFinish)
  } else if (hasActualStart) {
    // In progress — gray up to progress boundary, blue onward
    barStart = parseDate(task.tbStart)
    barEnd   = parseDate(task.tbFinish)
    isSplit  = true
  } else {
    // Not started — solid blue
    barStart = parseDate(task.tbStart)
    barEnd   = parseDate(task.tbFinish)
  }

  if (!barStart || !barEnd) return null

  const bar = getBarPixels(barStart, barEnd, days, keyMap, totalWidth)
  if (!bar) return null

  const barRadius = 3
  const leftRadius  = bar.beforeWindow ? 0 : barRadius
  const rightRadius = bar.afterWindow  ? 0 : barRadius

  const borderRadius = `${leftRadius}px ${rightRadius}px ${rightRadius}px ${leftRadius}px`

  const pct = parseInt(task.tbPercentComplete, 10) || 0

  if (hasActualFinish) {
    // Solid gray
    return (
      <div
        style={{
          position: 'absolute',
          left: bar.left,
          width: bar.width,
          top: BAR_TOP,
          height: BAR_H,
          borderRadius,
          background: T.gray,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: bar.beforeWindow ? 2 : 5,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {bar.beforeWindow && <span style={{ color: T.textBright, fontSize: 10, flexShrink: 0 }}>◀</span>}
        {bar.afterWindow  && (
          <span style={{ color: T.textBright, fontSize: 10, position: 'absolute', right: 2 }}>▶</span>
        )}
      </div>
    )
  }

  if (isSplit && pct > 0) {
    // Split bar: gray left + blue right
    const splitPx = getProgressSplitPx(
      task.tbStart, task.tbFinish, task.tbPercentComplete, days, keyMap, totalWidth
    )

    const grayWidth = splitPx != null
      ? Math.max(0, Math.min(splitPx - bar.left, bar.width))
      : 0
    const blueLeft  = bar.left + grayWidth
    const blueWidth = bar.width - grayWidth

    return (
      <>
        {grayWidth > 0 && (
          <div
            style={{
              position: 'absolute',
              left: bar.left,
              width: grayWidth,
              top: BAR_TOP,
              height: BAR_H,
              borderRadius: `${leftRadius}px 0 0 ${leftRadius}px`,
              background: T.gray,
              cursor: 'pointer',
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {bar.beforeWindow && <span style={{ color: T.textBright, fontSize: 10, paddingLeft: 2 }}>◀</span>}
          </div>
        )}
        {blueWidth > 0 && (
          <div
            style={{
              position: 'absolute',
              left: blueLeft,
              width: blueWidth,
              top: BAR_TOP,
              height: BAR_H,
              borderRadius: `0 ${rightRadius}px ${rightRadius}px 0`,
              background: T.blue,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: bar.afterWindow ? 2 : 0,
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {bar.afterWindow && <span style={{ color: T.textBright, fontSize: 10 }}>▶</span>}
          </div>
        )}
      </>
    )
  }

  // Solid blue (not started or in-progress with 0%)
  return (
    <div
      style={{
        position: 'absolute',
        left: bar.left,
        width: bar.width,
        top: BAR_TOP,
        height: BAR_H,
        borderRadius,
        background: T.blue,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: bar.beforeWindow ? 2 : 0,
        paddingRight: bar.afterWindow ? 2 : 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {bar.beforeWindow && <span style={{ color: T.textBright, fontSize: 10 }}>◀</span>}
      {bar.afterWindow  && <span style={{ color: T.textBright, fontSize: 10 }}>▶</span>}
    </div>
  )
}

// ─── Main GanttChart ──────────────────────────────────────────────────────────
const GanttChart = ({ tasks }) => {
  const [pageOffset, setPageOffset] = useState(0)
  const [tooltip, setTooltip] = useState(null)  // { task, x, y }

  const { viewStart, days, keyMap, totalWidth, today } = useMemo(
    () => buildTimeline(pageOffset),
    [pageOffset]
  )

  const monthGroups = useMemo(() => buildMonthGroups(days), [days])
  const weekGroups  = useMemo(() => buildWeekGroups(days),  [days])

  const todayKey     = dateKey(today)
  const todayIdx     = keyMap[todayKey]
  const currentWeek  = isoWeek(today)

  // Group tasks by tbL2, sort each group by tbStart
  const groups = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      const proj = t.tbL2 || '(No Project)'
      if (!map[proj]) map[proj] = []
      map[proj].push(t)
    })
    Object.values(map).forEach(arr => {
      arr.sort((a, b) => {
        const da = parseDate(a.tbStart)
        const db = parseDate(b.tbStart)
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        return da - db
      })
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [tasks])

  const handleBarEnter = useCallback((task, e) => {
    setTooltip({ task, x: e.clientX, y: e.clientY })
  }, [])

  const handleBarMove = useCallback((e) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
  }, [])

  const handleBarLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  // Shared cell style for header cells
  const hCell = (width, extra = {}) => ({
    width,
    minWidth: width,
    maxWidth: width,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
    borderRight: `1px solid ${T.border}`,
    ...extra,
  })

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'IBM Plex Sans', monospace", color: T.text }}>
      {/* Legend */}
      <Legend tasks={tasks} />

      {/* Nav controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
      }}>
        <button
          onClick={() => setPageOffset(p => p - 1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
            background: T.surface2, border: `1px solid ${T.border}`,
            color: T.text, fontSize: 12,
          }}
        >
          <ChevronLeft size={14} /> Prev 26w
        </button>
        <span style={{ fontSize: 12, color: T.textDim }}>
          {viewStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' — '}
          {addDays(viewStart, 28 * 7 - 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button
          onClick={() => setPageOffset(p => p + 1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
            background: T.surface2, border: `1px solid ${T.border}`,
            color: T.text, fontSize: 12,
          }}
        >
          Next 26w <ChevronRight size={14} />
        </button>
        {pageOffset !== 0 && (
          <button
            onClick={() => setPageOffset(0)}
            style={{
              padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
              background: 'transparent', border: `1px solid ${T.border}`,
              color: T.textDim, fontSize: 12,
            }}
          >
            Today
          </button>
        )}
      </div>

      {/* Gantt grid */}
      <div
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          overflow: 'auto',
          maxHeight: '75vh',
          position: 'relative',
        }}
        onMouseMove={handleBarMove}
      >
        {/* ── Sticky header ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: T.bg,
        }}>
          {/* Month row */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
            {/* Corner label cell spanning all 3 header rows via rowspan-equivalent */}
            <div style={{
              width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
              background: T.surface,
              borderRight: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center',
              paddingLeft: 10,
              height: 22,
            }}>
              <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>Task</span>
            </div>
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              {monthGroups.map((mg, i) => (
                <div
                  key={i}
                  style={{
                    ...hCell(mg.width),
                    paddingLeft: 4,
                    background: T.surface,
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.textBright,
                    borderRight: `1px solid ${T.borderWeek}`,
                  }}
                >
                  {mg.label}
                </div>
              ))}
            </div>
          </div>

          {/* Week row */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
            <div style={{
              width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
              background: T.surface,
              borderRight: `1px solid ${T.border}`,
              height: 20,
            }} />
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              {weekGroups.map((wg, i) => {
                const isCurrent = wg.weekNum === currentWeek
                return (
                  <div
                    key={i}
                    style={{
                      ...hCell(wg.width, { height: 20 }),
                      paddingLeft: 4,
                      background: isCurrent ? T.todayBg : T.surface,
                      fontSize: 10,
                      color: isCurrent ? T.blue : T.textDim,
                      fontWeight: isCurrent ? 700 : 400,
                      borderRight: `1px solid ${T.borderWeek}`,
                    }}
                  >
                    {wg.label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Day row */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
            <div style={{
              width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
              background: T.surface,
              borderRight: `1px solid ${T.border}`,
              height: 24,
            }} />
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              {days.map((col, i) => {
                const isToday   = i === todayIdx
                const dayNames  = ['Su','Mo','Tu','We','Th','Fr','Sa']
                const dayLabel  = dayNames[col.date.getDay()]
                const dateNum   = col.date.getDate()

                if (col.weekend) {
                  return (
                    <div
                      key={i}
                      style={{
                        width: WEEKEND_W, minWidth: WEEKEND_W, height: 24,
                        background: T.weekendBg,
                        borderRight: `1px solid ${T.border}`,
                        flexShrink: 0,
                      }}
                    />
                  )
                }

                // Monday gets week-start border
                const isMonday = col.date.getDay() === 1

                return (
                  <div
                    key={i}
                    style={{
                      width: WEEKDAY_W, minWidth: WEEKDAY_W, height: 24,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      background: isToday ? T.todayBg : T.surface,
                      borderLeft: isToday ? `2px solid ${T.todayBorder}` : isMonday ? `1px solid ${T.borderWeek}` : `1px solid ${T.border}`,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ fontSize: 8, color: isToday ? T.blue : T.textDim, lineHeight: 1 }}>{dayLabel}</span>
                    <span style={{ fontSize: 9, color: isToday ? T.blue : T.text, lineHeight: 1, fontWeight: isToday ? 700 : 400 }}>{dateNum}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        {groups.map(([projName, projTasks]) => (
          <div key={projName}>
            {/* Group header row */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${T.border}`,
              background: T.groupBg,
              height: ROW_H,
            }}>
              <div style={{
                width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
                position: 'sticky', left: 0, zIndex: 10,
                background: T.groupBg,
                borderRight: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center',
                paddingLeft: 10,
                overflow: 'hidden',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: T.textBright,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {projName}
                </span>
              </div>
              {/* Weekend shading across the full width */}
              <div style={{ position: 'relative', width: totalWidth, height: ROW_H, flexShrink: 0 }}>
                {days.filter(c => c.weekend).map(c => (
                  <div key={c.index} style={{
                    position: 'absolute', left: c.left, top: 0,
                    width: c.width, height: ROW_H,
                    background: T.weekendBg,
                  }} />
                ))}
                {todayIdx != null && (
                  <div style={{
                    position: 'absolute',
                    left: days[todayIdx].left,
                    top: 0,
                    width: days[todayIdx].width,
                    height: ROW_H,
                    background: T.todayBg,
                  }} />
                )}
              </div>
            </div>

            {/* Task rows */}
            {projTasks.map((task, ti) => (
              <div
                key={task.tbID ?? `${projName}-${ti}`}
                style={{
                  display: 'flex',
                  borderBottom: `1px solid ${T.border}`,
                  height: ROW_H,
                  background: T.surface,
                }}
              >
                {/* Label */}
                <div style={{
                  width: LABEL_W, minWidth: LABEL_W, flexShrink: 0,
                  position: 'sticky', left: 0, zIndex: 10,
                  background: T.surface,
                  borderRight: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center',
                  paddingLeft: 20,
                  overflow: 'hidden',
                }}>
                  <span style={{
                    fontSize: 11, color: T.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {task.tbName}
                  </span>
                </div>

                {/* Chart area */}
                <div style={{ position: 'relative', width: totalWidth, height: ROW_H, flexShrink: 0 }}>
                  {/* Weekend columns */}
                  {days.filter(c => c.weekend).map(c => (
                    <div key={c.index} style={{
                      position: 'absolute', left: c.left, top: 0,
                      width: c.width, height: ROW_H,
                      background: T.weekendBg,
                    }} />
                  ))}
                  {/* Today column */}
                  {todayIdx != null && (
                    <div style={{
                      position: 'absolute',
                      left: days[todayIdx].left,
                      top: 0,
                      width: days[todayIdx].width,
                      height: ROW_H,
                      background: T.todayBg,
                      borderLeft: `2px solid ${T.todayBorder}`,
                      boxSizing: 'border-box',
                    }} />
                  )}

                  {/* Bar */}
                  <TaskBar
                    task={task}
                    days={days}
                    keyMap={keyMap}
                    totalWidth={totalWidth}
                    onMouseEnter={e => handleBarEnter(task, e)}
                    onMouseLeave={handleBarLeave}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <Tooltip task={tooltip.task} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  )
}

export default GanttChart
