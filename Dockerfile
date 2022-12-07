FROM python:3.10-alpine
RUN apk add --update git nano openssh nodejs npm
RUN pip install --upgrade pip

RUN git clone https://github.com/elsiehupp/wikiteam3.git
RUN cd wikiteam3 && pip install --force-reinstall dist/*.whl

# Run our backup every day
COPY ./backup /etc/periodic/daily/backup
RUN dos2unix /etc/periodic/daily/backup
RUN chmod +x /etc/periodic/daily/backup

# Run our image backup every month
COPY ./backup_monthly /etc/periodic/monthly/backup_monthly
RUN dos2unix /etc/periodic/monthly/backup_monthly
RUN chmod +x /etc/periodic/monthly/backup_monthly
