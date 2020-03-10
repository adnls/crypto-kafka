import time
import requests
import json

from kafka import KafkaProducer


# kafka callbacks
def on_send_success(record_metadata):
    print(record_metadata.topic)
    print(record_metadata.partition)
    print(record_metadata.offset)


def on_send_error(excp):
    print('Error!!')


# api vars
url = "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD"
apiKey = "602da6585bacb33c13cf7105584fdb6f60df7607d4967c73d73d354e2608a8ed"
headers = {"authorization": "Apikey {}".format(apiKey)}

# other vars
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    retries=5,
    acks='all',
    value_serializer=str.encode,
)

current_price = 0

while True:

    res = requests.get(url=url, headers=headers)
    print("Status code : " + str(res.status_code))
    print(json.dumps(res.json(), indent=4))

    new_price = res.json()["USD"]

    if new_price != current_price:
        print("Price has changed!!")

        current_price = new_price

        producer.send('BTC', str(current_price)) \
            .add_callback(on_send_success) \
            .add_errback(on_send_error)

    time.sleep(10)
