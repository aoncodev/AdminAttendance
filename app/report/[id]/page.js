"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Award,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function EmployeeReportPage() {
  // For simplicity, assume employeeId = 1.
  const { id } = useParams(); // Get the employee ID from the URL
  const [report, setReport] = useState(null);
  const [weekStartDate, setWeekStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch report data using the current weekStartDate
  useEffect(() => {
    async function fetchReport() {
      try {
        const formattedStart = format(weekStartDate, "yyyy-MM-dd");
        const response = await fetch(
          `https://aoncodev.work.gd/report/${id}?start_date=${formattedStart}`
        );
        const data = await response.json();
        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    }
    if (id) {
      fetchReport();
    }
  }, [id, weekStartDate]);

  // Build an array of dates for the current week (Monday to Sunday)
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStartDate, i));
  }

  // Map attendance logs to dates (yyyy-MM-dd)
  const attendanceLogsByDate = {};
  if (report && report.attendance_logs) {
    report.attendance_logs.forEach((log) => {
      const logDate = new Date(log.clock_in);
      const key = format(logDate, "yyyy-MM-dd");
      attendanceLogsByDate[key] = log;
    });
  }

  // Show tasks only if the selected date is today
  const today = new Date();
  const tasksForToday =
    report && report.tasks && isSameDay(selectedDate, today)
      ? report.tasks
      : [];

  // Split tasks into two columns if more than one task exists
  const leftTasks =
    tasksForToday.length > 1
      ? tasksForToday.slice(0, Math.ceil(tasksForToday.length / 2))
      : [];
  const rightTasks =
    tasksForToday.length > 1
      ? tasksForToday.slice(Math.ceil(tasksForToday.length / 2))
      : [];

  // Week navigation function
  const navigateWeek = (direction) => {
    const newDate =
      direction === "prev"
        ? addDays(weekStartDate, -7)
        : addDays(weekStartDate, 7);
    setWeekStartDate(newDate);
  };

  return (
    <div className="h-screen w-screen overflow-auto bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">
        Employee Report {report && report.name}
      </h1>

      {/* Week View */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Week of {format(weekStartDate, "MMM d")} -{" "}
            {format(addDays(weekStartDate, 6), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const key = format(day, "yyyy-MM-dd");
            const log = attendanceLogsByDate[key];
            const totalPenalty = log?.penalties
              ? log.penalties.reduce((sum, p) => sum + p.price, 0)
              : 0;
            const totalBonus = log?.bonuses
              ? log.bonuses.reduce((sum, b) => sum + b.price, 0)
              : 0;
            return (
              <Card
                key={index}
                className={cn(
                  "overflow-hidden transition-colors hover:bg-accent/50 cursor-pointer",
                  isSameDay(day, selectedDate) &&
                    "border-2 border-primary bg-primary/5"
                )}
                onClick={() => setSelectedDate(day)}
              >
                <CardContent className="p-2">
                  <div className="mb-1 text-center">
                    <div className="text-xs font-medium">
                      {format(day, "EEE")}
                    </div>
                    <div className="text-base font-bold">
                      {format(day, "MMM d")}
                    </div>
                  </div>
                  {log ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>In/Out:</span>
                        </div>
                        <span>
                          {format(new Date(log.clock_in), "HH:mm")} -{" "}
                          {log.clock_out
                            ? format(new Date(log.clock_out), "HH:mm")
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Breaks:</span>
                        <span>
                          {log.break_logs && log.break_logs.length > 0
                            ? `${log.break_logs.length} (${(
                                log.break_logs.reduce(
                                  (total, b) =>
                                    total + (b.total_break_time || 0),
                                  0
                                ) * 60
                              ).toFixed(0)} min)`
                            : "0 (0 min)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Late:</span>
                        <span className={log.late_record ? "text-red-500" : ""}>
                          {log.late_record
                            ? `${log.late_record.late_duration_minutes} min`
                            : "0 min"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span>Penalty:</span>
                        </div>
                        <span className="text-red-500">
                          ₩{totalPenalty.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-green-500" />
                          <span>Bonus:</span>
                        </div>
                        <span className="text-green-500">
                          ₩{totalBonus.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-1">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">
                          {log.net_pay ? `₩${log.net_pay.toFixed(0)}` : "N/A"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Task & Penalty view */}
      <div className="grid grid-cols-3 gap-2">
        {isSameDay(selectedDate, today) ? (
          tasksForToday.length === 1 ? (
            <Card className="col-span-2 overflow-hidden">
              <CardContent className="p-3">
                <h2 className="text-lg font-bold mb-2">
                  Tasks for {format(selectedDate, "MMMM d, yyyy")}
                </h2>
                <div className="space-y-1">
                  {tasksForToday.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 rounded-md border p-2"
                    >
                      {task.status === true ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div
                        className={cn(
                          "text-sm",
                          task.status === true &&
                            "line-through text-muted-foreground"
                        )}
                      >
                        {task.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : tasksForToday.length > 1 ? (
            <>
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <h2 className="text-lg font-bold mb-2">
                    Tasks for {format(selectedDate, "MMMM d, yyyy")}
                  </h2>
                  <div className="space-y-1">
                    {leftTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 rounded-md border p-2"
                      >
                        {task.status === true ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div
                          className={cn(
                            "text-sm",
                            task.status === true &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {task.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <h2 className="text-lg font-bold mb-2">
                    More Tasks for {format(selectedDate, "MMMM d, yyyy")}
                  </h2>
                  <div className="space-y-1">
                    {rightTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 rounded-md border p-2"
                      >
                        {task.status === true ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div
                          className={cn(
                            "text-sm",
                            task.status === true &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {task.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="col-span-2 overflow-hidden">
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">
                  No tasks for this day
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="col-span-2 overflow-hidden">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">
                No tasks for this day
              </p>
            </CardContent>
          </Card>
        )}

        {/* Penalties & Warnings Column */}
        <Card className="overflow-hidden">
          <CardContent className="p-3">
            <h2 className="text-lg font-bold mb-2">
              Penalties & Warnings for {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            {report &&
            report.attendance_logs &&
            report.attendance_logs.find((log) =>
              isSameDay(new Date(log.clock_in), selectedDate)
            ) ? (
              (() => {
                const currentLog = report.attendance_logs.find((log) =>
                  isSameDay(new Date(log.clock_in), selectedDate)
                );
                if (
                  currentLog &&
                  currentLog.penalties &&
                  currentLog.penalties.length > 0
                ) {
                  return (
                    <div className="space-y-1">
                      {currentLog.penalties.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="text-sm">{item.description}</span>
                          </div>
                          <span className="text-sm text-red-500">
                            ₩{item.price.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <p className="text-sm text-muted-foreground">
                      No penalties or warnings
                    </p>
                  );
                }
              })()
            ) : (
              <p className="text-sm text-muted-foreground">
                No penalties or warnings
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
