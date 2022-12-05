FROM python:3.10-alpine
RUN apk add --update git nano openssh
RUN pip install --upgrade pip

RUN git clone https://github.com/elsiehupp/wikiteam3.git
RUN cd wikiteam3 && pip install --force-reinstall dist/*.whl

# Run our backup every X time
COPY ./backup /etc/periodic/daily/backup
RUN chmod +x /etc/periodic/daily/backup