import { useState, useMemo, useEffect } from "react";
import {  Clock, User, MapPin, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateAppointmentMutation,
  useGetAvailableSlotsQuery,
} from "@/services/room-appointment/room-appointment.service";
import { toast } from "sonner";
import { useGetProfileQuery } from "@/services/profile/profile.service";
import { useSelector } from "react-redux";

interface BookingAppointmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  buildingId: string;
  buildingName: string;
  postTitle: string;
  address: string;
}

const BookingAppointment = ({
  open,
  onOpenChange,
  postId,
  buildingId,
  buildingName,
  address,
}: BookingAppointmentProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [tenantNote, setTenantNote] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
    const { isAuthenticated } = useSelector((state: any) => state.auth);
  
    const { data: profileData } = useGetProfileQuery(undefined, {
          skip: !isAuthenticated,
        });
  
        useEffect(() => {
        if (profileData) {
          setContactName(profileData?.user.userInfo?.fullName || "");
          setContactPhone(profileData?.user.userInfo?.phoneNumber || "");
        }
      }, [profileData]);

    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


  const dateRange = useMemo(() => {
    const today = new Date();
    const threeWeeksLater = new Date();
    threeWeeksLater.setDate(today.getDate() + 30); 
    
    return {
        startDate: formatDateLocal(today),
        endDate: formatDateLocal(threeWeeksLater)
    };
  }, []);

  const { data: availableSlotsData, isLoading: isLoadingSlots } = useGetAvailableSlotsQuery(
    { 
      buildingId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    },
    { skip: !buildingId || !open }
  );

  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();

  useEffect(() => {
    if (open) {
      setSelectedDate(undefined);
      setSelectedStartTime("");
      setSelectedEndTime("");
      setTenantNote("");
      setCurrentMonth(new Date());
    }
  }, [open]);

  const availableDays = availableSlotsData?.availableDays || [];

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - firstDay.getDay());
    
    const weeks = [];
    const currentDate = new Date(startDay);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const dateStr = formatDateLocal(currentDate);

        const availableDay = availableDays.find(d => d.date === dateStr);
        
        const hasSlots = availableDay && availableDay.slots && availableDay.slots.length > 0;
        
        weekDays.push({
          date: new Date(currentDate),
          dateStr,
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: currentDate.toDateString() === new Date().toDateString(),
          isSelected: selectedDate && selectedDate.toDateString() === currentDate.toDateString(),
          availableSlots: availableDay?.slots || [],
          hasSlots: hasSlots,
          availableTimeRanges: availableDay?.slots.map(slot => ({
            start: slot.startTime,
            end: slot.endTime
          })) || []
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(weekDays);
    }
    
    return weeks;
  }, [currentMonth, availableDays, selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = formatDateLocal(date);
    const availableDay = availableDays.find(d => d.date === dateStr);
    
    if (availableDay?.slots && availableDay.slots.length > 0) {
      setSelectedDate(date);
      setSelectedStartTime("");
      setSelectedEndTime("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate ||  !contactName || !contactPhone) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // if (selectedStartTime >= selectedEndTime) {
    //   toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
    //   return;
    // }

    const timeSlot = `${selectedStartTime}`;

    try {
      await createAppointment({
        postId,
        buildingId,
        date: formatDateLocal(selectedDate),
        timeSlot: timeSlot,
        contactName,
        contactPhone,
        tenantNote: tenantNote || undefined,
      }).unwrap();

      toast.success("Lịch hẹn xem phòng của bạn đã được ghi nhận");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric'
    });
  };

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const renderTimeRanges = (availableTimeRanges: {start: string, end: string}[]) => {
    if (availableTimeRanges.length === 0) return null;

    return (
      <div className="space-y-1">
        {availableTimeRanges.slice(0, 2).map((range, index) => (
          <div
            key={index}
            className="text-xs p-1 rounded text-center truncate  border border-gray-200"
          >
            {range.start} - {range.end}
          </div>
        ))}
        {availableTimeRanges.length > 2 && (
          <div className="text-xs text-center text-muted-foreground">
            +{availableTimeRanges.length - 2} khung
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              Đặt lịch hẹn xem phòng
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <Card className="lg:col-span-1]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#4C9288]" />
                Thông tin phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <CardDescription className="font-semibold text-sm mb-1">
                    ĐỊA CHỈ
                  </CardDescription>
                  <p className="text-sm">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <CardDescription className="font-semibold text-sm mb-1">
                    TÒA NHÀ
                  </CardDescription>
                  <p className="text-sm">{buildingName}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <CardDescription className="font-semibold text-sm mb-2">
                  THỜI GIAN HẸN
                </CardDescription>
                {selectedDate ? (
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-[#4C9288] text-white">
                      {formatDisplayDate(selectedDate)}
                    </Badge>
                    {selectedStartTime && selectedEndTime && (
                      <div className="text-sm font-medium">
                        {selectedStartTime} - {selectedEndTime}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa chọn thời gian
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Chọn ngày hẹn
                  </CardTitle>
                  <CardDescription>
                    Chọn ngày có sẵn (được đánh dấu màu xanh) để nhập thời gian hẹn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingSlots ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : availableDays.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Không có lịch trống trong thời gian tới
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigateMonth('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <h3 className="text-lg font-semibold">
                          {formatMonthYear(currentMonth)}
                        </h3>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigateMonth('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="border rounded-lg">
                        <div className="grid grid-cols-7 border-b">
                          {dayNames.map((day, index) => (
                            <div
                              key={day}
                              className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {calendarGrid.map((week, weekIndex) => (
                          <div
                            key={weekIndex}
                            className="grid grid-cols-7 border-b last:border-b-0"
                          >
                            {week.map((day, dayIndex) => (
                              <div
                                key={dayIndex}
                                className={`
                                  min-h-[120px] p-2 border-r last:border-r-0 cursor-pointer transition-colors
                                  ${!day.isCurrentMonth ? 'bg-muted/30 opacity-50' : ''}
                                  ${day.isSelected ? 'bg-[#4C9288] text-white' : ''}
                                  ${day.hasSlots && !day.isSelected ? 'bg-green-50 hover:bg-green-100' : ''}
                                  ${!day.hasSlots && day.isCurrentMonth ? 'bg-white hover:bg-muted/50' : ''}
                                `}
                                onClick={() => day.hasSlots && handleDateSelect(day.date)}
                              >
                                <div className={`
                                  text-sm font-medium mb-1
                                  ${day.isToday && !day.isSelected ? 'text-[#4C9288]' : ''}
                                  ${day.isSelected ? 'text-white' : ''}
                                `}>
                                  {day.date.getDate()}
                                </div>
                                
                                {day.hasSlots && day.isCurrentMonth && (
                                  renderTimeRanges(day.availableTimeRanges)
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#4C9288]" />
                      Chọn thời gian hẹn - {formatDisplayDate(selectedDate)}
                    </CardTitle>
                    <CardDescription>
                      Nhập thời gian đến xem
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="startTime">
                            Thời gian xem <span className="text-red-500">*</span>
                          </Label>
                           <Input
                              type="time"
                              className="w-32"
                              value={selectedStartTime}
                              onChange={(e) => setSelectedStartTime(e.target.value)}
                            />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Khung giờ rảnh trong ngày:</h4>
                          {calendarGrid
                            .flat()
                            .find(day => day.date.toDateString() === selectedDate.toDateString())
                            ?.availableTimeRanges.map((range, index) => (
                              <div key={index} className="text-sm text-blue-700 mb-1">
                                • {range.start} - {range.end}
                              </div>
                            )) || (
                              <p className="text-sm text-muted-foreground">Không có khung giờ rảnh</p>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#4C9288]" />
                      Thông tin liên hệ
                    </CardTitle>
                    <CardDescription>
                      Vui lòng cung cấp thông tin để chủ nhà liên hệ xác nhận
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactName">
                            Họ và tên <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contactName"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Nhập họ và tên"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">
                            Số điện thoại <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contactPhone"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenantNote">Ghi chú (tùy chọn)</Label>
                        <Textarea
                          id="tenantNote"
                          value={tenantNote}
                          onChange={(e) => setTenantNote(e.target.value)}
                          placeholder="Thêm ghi chú cho chủ nhà..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-[#4C9288] hover:bg-[#3a7a70]"
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <>
                              <Spinner className="mr-2 h-4 w-4" />
                              Đang xử lý...
                            </>
                          ) : (
                            "Xác nhận đặt lịch"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onOpenChange(false)}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingAppointment;