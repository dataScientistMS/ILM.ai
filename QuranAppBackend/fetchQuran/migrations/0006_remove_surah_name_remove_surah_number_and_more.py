# Generated by Django 4.2.7 on 2023-12-19 12:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("fetchQuran", "0005_message_status"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="surah",
            name="name",
        ),
        migrations.RemoveField(
            model_name="surah",
            name="number",
        ),
        migrations.RemoveField(
            model_name="surah",
            name="number_of_verses",
        ),
        migrations.AddField(
            model_name="surah",
            name="bismillah_pre",
            field=models.BooleanField(default=True, null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="english_name",
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="name_arabic",
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="name_complex",
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="name_simple",
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="pages",
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="revelation_order",
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="revelation_place",
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="surah",
            name="verses_count",
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name="surah",
            name="id",
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
