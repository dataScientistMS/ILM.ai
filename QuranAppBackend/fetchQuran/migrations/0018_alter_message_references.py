# Generated by Django 4.2.7 on 2023-12-22 10:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("fetchQuran", "0017_alter_message_references"),
    ]

    operations = [
        migrations.AlterField(
            model_name="message",
            name="references",
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
    ]
